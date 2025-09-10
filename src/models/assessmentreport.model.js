import mongoose from 'mongoose';

// Schema for the nested industryTrends object within a CareerMatch
const industryTrendsSchema = new mongoose.Schema({
  growth: {
    type: String,
    required: [true, 'Growth trend is required.'],
    trim: true,
  },
  demand: {
    type: String,
    required: [true, 'Demand level is required.'],
    trim: true,
  },
  averageSalary: {
    type: String,
    required: [true, 'Average salary is required.'],
    trim: true,
  },
}, { _id: false }); // _id is not needed for this sub-document

// Schema for each career match in the topCareerMatches array
const careerMatchSchema = new mongoose.Schema({
  career: {
    type: String,
    required: [true, 'Career name is required.'],
    trim: true,
  },
  matchPercentage: {
    type: Number,
    required: [true, 'Match percentage is required.'],
    min: 0,
    max: 100,
  },
  requiredSkills: {
    type: [String],
    default: [],
  },
  industryTrends: {
    type: industryTrendsSchema,
    required: true,
  },
  description: String,
  educationPath: String,
}, { _id: false });

// Schema for each phase in the actionPlan array
const actionPlanSchema = new mongoose.Schema({
    timeline: {
        type: String,
        required: [true, 'Timeline is required for an action plan phase.'],
    },
    actions: {
        type: [String],
        required: [true, 'Actions are required for an action plan phase.'],
        default: [],
    }
}, { _id: false });


// Main schema for the AssessmentReport
const assessmentReportSchema = new mongoose.Schema({
  // Link to the user who took the assessment
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assumes you have a 'User' model
    required: true,
    unique: true, // Each user should have only one report
  },
  overallAnalysis: {
    type: String,
    required: [true, 'Overall analysis is required.'],
  },
  topCareerMatches: {
    type: [careerMatchSchema],
    default: [],
  },
  skillGaps: {
    type: [String],
    default: [],
  },
  recommendedLearningPath: {
    type: [String],
    default: [],
  },
  personalityType: {
    type: String,
    required: [true, 'Personality type is required.'],
  },
  interests: {
    type: [String],
    default: [],
  },
  strengths: {
    type: [String],
    default: [],
  },
  weaknesses: {
    type: [String],
    default: [],
  },
  actionPlan: {
    type: [actionPlanSchema],
    default: [],
  },
  completedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  // Automatically adds createdAt and updatedAt fields
  timestamps: true,
});

// If the model already exists, use it. Otherwise, create a new one.
const AssessmentReport = mongoose.models.AssessmentReport || mongoose.model('AssessmentReport', assessmentReportSchema);

export default AssessmentReport;