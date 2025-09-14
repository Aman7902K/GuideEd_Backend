import AssessmentAttempt from '../models/assessmentattempt.model.js';
import Question from '../models/question.model.js';
import { evaluateAnswer } from '../services/gemini.services.js';
import { aggregateAnswers } from '../services/scoring.services.js';
import { upsertReport } from '../services/report.services.js';
import asyncHandler from '../utils/asyncHandler.js';

export const startAssessment = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ success: false, message: 'User not authenticated.' });
  }

  // Delete any existing in-progress attempt for this user
  await AssessmentAttempt.deleteMany({ userId, status: 'in_progress' });

  // Sample up to 10 questions safely
  const totalQuestions = await Question.countDocuments();
  if (!totalQuestions) {
    return res.status(500).json({ success: false, message: 'No questions available.' });
  }
  const sampleSize = Math.min(10, totalQuestions);
  const questions = await Question.aggregate([{ $sample: { size: sampleSize } }]);

  const attempt = await AssessmentAttempt.create({
    userId,
    status: 'in_progress',
    questions: questions.map(q => q._id),
    meta: { totalQuestions: questions.length }
  });

  return res.status(201).json({
    success: true,
    data: {
      attemptId: attempt._id,
      questions: questions.map(q => ({
        id: q._id,
        text: q.text,
        topic: q.topic,
        type: q.type,
        options: q.type === 'mcq' ? q.options : undefined
      }))
    }
  });
});
export const submitAnswer = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { attemptId, questionId, userAnswer } = req.body;
  if (!attemptId || !questionId || !userAnswer) {
    return res.status(422).json({ success: false, message: 'attemptId, questionId & userAnswer required.' });
  }

  const attempt = await AssessmentAttempt.findById(attemptId).populate('questions');
  if (!attempt) return res.status(404).json({ success: false, message: 'Attempt not found.' });
  if (String(attempt.userId) !== String(userId)) {
    return res.status(403).json({ success: false, message: 'Not authorized for this attempt.' });
  }
  if (attempt.status !== 'in_progress') {
    return res.status(400).json({ success: false, message: 'Attempt not in progress.' });
  }

  if (!attempt.questions.find(q => String(q._id) === String(questionId))) {
    return res.status(400).json({ success: false, message: 'Question not part of attempt.' });
  }

  if ((attempt.answers || []).find(a => String(a.questionId) === String(questionId))) {
    return res.status(409).json({ success: false, message: 'Answer already submitted for this question.' });
  }

  const question = await Question.findById(questionId);
  if (!question) return res.status(404).json({ success: false, message: 'Question not found.' });

  const evaluation = await evaluateAnswer({
    question: question.text,
    idealAnswer: question.idealAnswer,
    userAnswer: question.type === 'mcq' ? `Selected option: ${userAnswer}` : userAnswer
  });

  attempt.answers = attempt.answers || [];
  attempt.answers.push({
    questionId,
    userAnswer,
    evaluated: true,
    correctnessScore: evaluation.correctnessScore,
    feedback: evaluation.feedback,
    inferredSkills: evaluation.inferredSkills,
    inferredInterests: evaluation.inferredInterests
  });
  await attempt.save();

  return res.json({
    success: true,
    data: {
      questionId,
      correctnessScore: evaluation.correctnessScore,
      feedback: evaluation.feedback,
      inferredSkills: evaluation.inferredSkills,
      inferredInterests: evaluation.inferredInterests
    }
  });
});

export const finalizeAssessment = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { attemptId } = req.body;
  if (!attemptId) return res.status(422).json({ success: false, message: 'attemptId required.' });

  const attempt = await AssessmentAttempt.findById(attemptId);
  if (!attempt) return res.status(404).json({ success: false, message: 'Attempt not found.' });
  if (String(attempt.userId) !== String(userId)) {
    return res.status(403).json({ success: false, message: 'Not authorized for this attempt.' });
  }
  if (attempt.status !== 'in_progress') {
    return res.status(400).json({ success: false, message: 'Attempt already finalized.' });
  }

  const total = attempt?.meta?.totalQuestions || attempt.questions.length;
  const answered = attempt.answers?.length || 0;
  if (answered < Math.ceil(total * 0.5)) {
    return res.status(400).json({
      success: false,
      message: `Answer at least 50% of questions before finalizing. (${answered}/${total})`
    });
  }

  const agg = aggregateAnswers(attempt.answers);

  const overallAnalysis = `
Average Score: ${(agg.averageScore * 100).toFixed(1)}%.
Strengths: ${agg.strengths.join(', ') || 'None'}.
Weaknesses: ${agg.weaknesses.join(', ') || 'None'}.
Interests: ${agg.interests.join(', ') || 'None'}.
  `.trim();

  const report = await upsertReport({
    userId: attempt.userId,
    overallAnalysis,
    strengths: agg.strengths,
    weaknesses: agg.weaknesses,
    interests: agg.interests,
    averageScore: agg.averageScore
  });

  attempt.status = 'completed';
  attempt.completedAt = new Date();
  await attempt.save();

  return res.json({
    success: true,
    data: { reportId: report._id, report }
  });
});

export const getAttempt = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { id } = req.params;

  const attempt = await AssessmentAttempt.findById(id)
    .populate('questions', 'text topic type');
  if (!attempt) return res.status(404).json({ success: false, message: 'Attempt not found.' });
  if (String(attempt.userId) !== String(userId)) {
    return res.status(403).json({ success: false, message: 'Not authorized for this attempt.' });
  }

  return res.json({ success: true, data: attempt });
});