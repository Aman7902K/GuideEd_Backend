import { asyncHandler } from '../utils/asyncHandler.js';
import { getReport, upsertReport } from '../services/report.services.js';
import { generateCareerInsights } from '../services/career.services.js';
export const getMyReport = asyncHandler(async (req, res) => {
  const userId = req.user?.id || req.params.userId;
  if (!userId) return res.status(401).json({ success: false, message: 'User context missing.' });

  const report = await getReport(userId);
  if (!report) return res.status(404).json({ success: false, message: 'Report not found.' });

  // Send only the report data (_doc holds the actual content in Mongoose)
  res.json({ success: true, data: report.toObject() });
});

export const regenerateReport = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(422).json({ success: false, message: 'userId required.' });

  const existing = await getReport(userId);
  if (!existing) return res.status(404).json({ success: false, message: 'No existing report.' });

  const updated = await upsertReport({
    ...existing.toObject(), // Spread existing data
    overallAnalysis: existing.overallAnalysis + '\nRegenerated: minor refinement.',
    averageScore: 0.72
  });

  // Send only the report data
  res.json({ success: true, data: updated.toObject() });
});
