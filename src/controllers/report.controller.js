import { asyncHandler } from '../utils/asyncHandler.js';
import { getReport, upsertReport } from '../services/report.service.js';

/**
 * Get report of current user (user id can come from auth or path)
 */
export const getMyReport = asyncHandler(async (req, res) => {
  const userId = req.user?.id || req.params.userId;
  if (!userId) return res.status(401).json({ success: false, message: 'User context missing.' });
  const report = await getReport(userId);
  if (!report) return res.status(404).json({ success: false, message: 'Report not found.' });
  res.json({ success: true, data: report });
});

/**
 * Simple regeneration endpoint (for demonstration).
 * In a real scenario you'd recompute from raw attempt answers.
 */
export const regenerateReport = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(422).json({ success: false, message: 'userId required.' });

  const existing = await getReport(userId);
  if (!existing) return res.status(404).json({ success: false, message: 'No existing report.' });

  const updated = await upsertReport({
    userId,
    overallAnalysis: existing.overallAnalysis + '\nRegenerated: minor refinement.',
    strengths: existing.strengths,
    weaknesses: existing.weaknesses,
    interests: existing.interests,
    averageScore: 0.72 // placeholder; re-derive realistically
  });

  res.json({ success: true, data: updated });
});