// report.services.js

import AssessmentReport from '../models/assessmentreport.model.js';
import { generateCareerInsights } from './career.services.js';
import { buildLearningPath, buildActionPlan, inferPersonalityType } from './traits.services.js';

// Upsert or create the assessment report
export async function upsertReport({ userId, overallAnalysis, strengths, weaknesses, interests, averageScore, userLocation }) {
  // Generate career insights and nearby colleges using Gemini
  const careerData = await generateCareerInsights({
    strengths,
    weaknesses,
    interests,
    averageScore,
    userLocation
  });

  // Derive personality type and other traits if needed
  const personalityType = inferPersonalityType({ strengths, interests, averageScore });

  // Optionally build learning path and action plan using traits service, fallback if Gemini is incomplete
  const recommendedLearningPath = careerData.learningPath.length > 0 
    ? careerData.learningPath 
    : buildLearningPath([]);

  const actionPlan = careerData.actionPlan.length > 0 
    ? careerData.actionPlan 
    : buildActionPlan([]);

  const doc = {
    overallAnalysis,
    topCareerMatches: careerData.topCareerPaths || [],
    skillGaps: [], // You may integrate deriveSkillGaps if needed
    recommendedLearningPath,
    actionPlan,
    personalityType,
    interests,
    strengths,
    weaknesses,
    nearbyColleges: careerData.nearbyColleges || [],
    completedAt: new Date()
  };

  // Find existing report and update or create a new one
  const existing = await AssessmentReport.findOne({ userId });
  if (existing) {
    Object.assign(existing, doc);
    await existing.save();
    return existing;
  }
  return AssessmentReport.create({ userId, ...doc });
}

// Retrieve the report by userId
export function getReport(userId) {
  return AssessmentReport.findOne({ userId });
}
