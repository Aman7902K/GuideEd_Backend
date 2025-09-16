import mongoose from 'mongoose';

// Subdocument schema for nearby colleges
const NearbyCollegeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    website: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    matchingPrograms: { type: [String], default: [] },
    reason: { type: String, default: '' }
  },
  { _id: false }
);

// Main schema for the AssessmentReport
const assessmentReportSchema = new mongoose.Schema(
  {
    // Link to the user who took the assessment
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Assumes you have a 'User' model
      required: true,
      unique: true, // Each user should have only one report
    },

    // Optional: store location used for college recommendations
    userLocation: {
      city: { type: String, default: '' },
      state: { type: String, default: '' }
    },

    overallAnalysis: {
      type: String,
      required: [true, 'Overall analysis is required.'],
    },

    topCareerMatches: {
      type: [
        {
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
          },
          description: String,
          educationPath: String,
          _id: false,
        },
      ],
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
      type: [
        {
          timeline: {
            type: String,
            required: [true, 'Timeline is required for an action plan phase.'],
          },
          actions: {
            type: [String],
            required: [true, 'Actions are required for an action plan phase.'],
            default: [],
          },
          _id: false,
        },
      ],
      default: [],
    },

    // New: interest-aware college list
    nearbyColleges: {
      type: [NearbyCollegeSchema],
      default: [],
    },

    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    // Automatically adds createdAt and updatedAt fields
    timestamps: true,
  }
);

// If the model already exists, use it. Otherwise, create a new one.
const AssessmentReport =
  mongoose.models.AssessmentReport ||
  mongoose.model('AssessmentReport', assessmentReportSchema);

export default AssessmentReport;