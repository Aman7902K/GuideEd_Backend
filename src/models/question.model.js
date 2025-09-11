import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true },
  topic: { type: String, required: true, trim: true },                 // e.g. "logic", "math"
  difficulty: { type: String, enum: ['easy','medium','hard'], default: 'medium' },
  idealAnswer: { type: String, required: true },                       // Reference answer
  skillTags: { type: [String], default: [] },                          // ["analytical","problem-solving"]
  type: { type: String, enum: ['open','mcq'], default: 'open' },
  options: { type: [String], default: [] },                            // For MCQ
  correctOptionIndex: { type: Number }                                 // For MCQ (optional usage)
}, { timestamps: true });

const Question = mongoose.models.Question || mongoose.model('Question', questionSchema);
export default Question;