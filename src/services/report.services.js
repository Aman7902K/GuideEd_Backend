import AssessmentReport from '../models/assessmentreport.model.js';
import { matchCareers, deriveSkillGaps } from './career.services.js';
import { buildLearningPath, buildActionPlan, inferPersonalityType } from './traits.services.js';

export async function upsertReport({ userId, overallAnalysis, strengths, weaknesses, interests, averageScore }) {
  const topCareerMatches = matchCareers({ strengths, interests, averageScore });
  const skillGaps = deriveSkillGaps(strengths, topCareerMatches);
  const personalityType = inferPersonalityType({ strengths, interests, averageScore });
  const recommendedLearningPath = buildLearningPath(skillGaps);
  const actionPlan = buildActionPlan(skillGaps);

  const doc = {
    overallAnalysis,
    topCareerMatches,
    skillGaps,
    recommendedLearningPath,
    personalityType,
    interests,
    strengths,
    weaknesses,
    actionPlan,
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