import { Router } from 'express';
import { getMyReport, regenerateReport } from '../controllers/report.controller.js';

const router = Router();

// GET /api/report/mine/:userId?   (userId optional if auth middleware supplies req.user.id)
router.get('/mine/:userId?', getMyReport);

// POST /api/report/regenerate
router.post('/regenerate', regenerateReport);

export default router;