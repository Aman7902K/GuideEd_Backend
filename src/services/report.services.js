import AssessmentReport from '../models/assessmentreport.model.js';
import { generateCareerInsights } from './career.services.js';
import { buildLearningPath, buildActionPlan, inferPersonalityType } from './traits.services.js';

export async function upsertReport({ userId, overallAnalysis, strengths = [], weaknesses = [], interests = [], averageScore, userLocation = {} }) {
  // Generate career insights + interest-aware nearby colleges
  const careerData = await generateCareerInsights({
    strengths,
    weaknesses,
    interests,
    averageScore,
    userLocation
  });

  const personalityType = inferPersonalityType({ strengths, interests, averageScore });

  const recommendedLearningPath = Array.isArray(careerData.learningPath) && careerData.learningPath.length > 0
    ? careerData.learningPath
    : buildLearningPath([]);

  const actionPlan = Array.isArray(careerData.actionPlan) && careerData.actionPlan.length > 0
    ? careerData.actionPlan
    : buildActionPlan([]);

  const doc = {
    overallAnalysis,
    topCareerMatches: careerData.topCareerPaths || [],
    skillGaps: [], // Consider adding deriveSkillGaps in the future
    recommendedLearningPath,
    actionPlan,
    personalityType,
    interests,
    strengths,
    weaknesses,
    nearbyColleges: Array.isArray(careerData.nearbyColleges) ? careerData.nearbyColleges : [],
    completedAt: new Date()
  };

  const existing = await AssessmentReport.findOne({ userId });
  if (existing) {
    Object.assign(existing, doc);
    await existing.save();
    return existing;
  }
  return AssessmentReport.create({ userId, ...doc });
}

export function getReport(userId) {
  return AssessmentReport.findOne({ userId });
}