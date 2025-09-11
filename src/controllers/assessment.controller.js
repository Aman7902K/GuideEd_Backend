import AssessmentAttempt from '../models/assessmentattempt.model.js';
import Question from '../models/question.model.js';
import { evaluateAnswer } from '../services/gemini.service.js';
import { aggregateAnswers } from '../services/scoring.service.js';
import { upsertReport } from '../services/report.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * NOTE: Assumes req.user.id is set by auth middleware.
 * Fallback to body userId for development if not present.
 */

export const startAssessment = asyncHandler(async (req, res) => {
  const userId = req.user?.id || req.body.userId;
  if (!userId) return res.status(401).json({ success: false, message: 'User not authenticated.' });

  const existing = await AssessmentAttempt.findOne({ userId, status: 'in_progress' });
  if (existing) {
    return res.json({ success: true, data: existing, message: 'Existing attempt returned.' });
  }

  // Random 10 questions (tweak size as needed)
  const questions = await Question.aggregate([{ $sample: { size: 10 } }]);
  if (!questions.length) {
    return res.status(500).json({ success: false, message: 'No questions available.' });
  }

  const attempt = await AssessmentAttempt.create({
    userId,
    questions: questions.map(q => q._id),
    meta: { totalQuestions: questions.length }
  });

  res.status(201).json({
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
  const { attemptId, questionId, userAnswer } = req.body;
  if (!attemptId || !questionId || !userAnswer) {
    return res.status(422).json({ success: false, message: 'attemptId, questionId & userAnswer required.' });
  }

  const attempt = await AssessmentAttempt.findById(attemptId).populate('questions');
  if (!attempt) return res.status(404).json({ success: false, message: 'Attempt not found.' });
  if (attempt.status !== 'in_progress')
    return res.status(400).json({ success: false, message: 'Attempt not in progress.' });

  if (!attempt.questions.find(q => q._id.toString() === questionId)) {
    return res.status(400).json({ success: false, message: 'Question not part of attempt.' });
  }

  if (attempt.answers.find(a => a.questionId.toString() === questionId)) {
    return res.status(409).json({ success: false, message: 'Answer already submitted for this question.' });
  }

  const question = await Question.findById(questionId);
  if (!question) return res.status(404).json({ success: false, message: 'Question not found.' });

  const evaluation = await evaluateAnswer({
    question: question.text,
    idealAnswer: question.idealAnswer,
    userAnswer: question.type === 'mcq' ? `Selected option: ${userAnswer}` : userAnswer
  });

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

  res.json({
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
  const { attemptId } = req.body;
  if (!attemptId) return res.status(422).json({ success: false, message: 'attemptId required.' });

  const attempt = await AssessmentAttempt.findById(attemptId);
  if (!attempt) return res.status(404).json({ success: false, message: 'Attempt not found.' });
  if (attempt.status !== 'in_progress')
    return res.status(400).json({ success: false, message: 'Attempt already finalized.' });

  const total = attempt.meta.totalQuestions || attempt.questions.length;
  if (attempt.answers.length < Math.ceil(total * 0.5)) {
    return res.status(400).json({
      success: false,
      message: `Answer at least 50% of questions before finalizing. (${attempt.answers.length}/${total})`
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

  res.json({
    success: true,
    data: { reportId: report._id, report }
  });
});

export const getAttempt = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const attempt = await AssessmentAttempt.findById(id)
    .populate('questions', 'text topic type');
  if (!attempt) return res.status(404).json({ success: false, message: 'Attempt not found.' });
  res.json({ success: true, data: attempt });
});