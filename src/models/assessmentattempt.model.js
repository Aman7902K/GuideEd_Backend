import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  userAnswer: { type: String, required: true },
  evaluated: { type: Boolean, default: false },
  correctnessScore: { type: Number, min: 0, max: 1 },
  feedback: { type: String },
  inferredSkills: { type: [String], default: [] },
  inferredInterests: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const assessmentAttemptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
  status: { type: String, enum: ['in_progress','completed','cancelled'], default: 'in_progress' },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  answers: { type: [answerSchema], default: [] },
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  meta: { totalQuestions: Number }
}, { timestamps: true });

const AssessmentAttempt = mongoose.models.AssessmentAttempt ||
  mongoose.model('AssessmentAttempt', assessmentAttemptSchema);

export default AssessmentAttempt;