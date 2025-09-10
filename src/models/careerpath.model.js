import mongoose from 'mongoose';

// Schema for the nested 'actions' within a CareerPathStep
const actionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["course", "certification", "project", "networking"],
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  url: {
    type: String,
    trim: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
}, { _id: false });

// Schema for each 'step' in a CareerPath
const careerPathStepSchema = new mongoose.Schema({
  // A unique identifier for the step within its path (e.g., 'foundations')
  id: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  duration: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ["Beginner", "Intermediate", "Advanced"],
    required: true,
  },
  skillsRequired: {
    type: [String],
    default: [],
  },
  skillsGained: {
    type: [String],
    default: [],
  },
  averageSalary: String,
  jobTitles: {
    type: [String],
    default: [],
  },
  actions: {
    type: [actionSchema],
    default: [],
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  isCurrentStep: {
    type: Boolean,
    default: false,
  },
  prerequisites: {
    type: [String],
    default: [],
  },
});

// Main schema for a user's specific CareerPath
// This model stores a specific path template assigned to a user, along with their progress.
const careerPathSchema = new mongoose.Schema({
  // Link to the user this career path instance belongs to
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assumes a 'User' model
    required: true,
  },
  // Identifier for the base career path template (e.g., 'data-science')
  pathTemplateId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: String,
  industry: String,
  matchPercentage: {
    type: Number,
    min: 0,
    max: 100,
  },
  totalDuration: String,
  averageStartingSalary: String,
  averageMidLevelSalary: String,
  averageSeniorSalary: String,
  jobGrowthRate: String,
  steps: {
    type: [careerPathStepSchema],
    default: [],
  },
}, {
  timestamps: true,
});

// Create a compound index to ensure a user has only one instance of each career path template
careerPathSchema.index({ userId: 1, pathTemplateId: 1 }, { unique: true });

const CareerPath = mongoose.models.CareerPath || mongoose.model('CareerPath', careerPathSchema);

export default CareerPath;