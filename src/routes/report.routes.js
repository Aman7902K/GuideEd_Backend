import { Router } from 'express';
import { getMyReport, regenerateReport } from '../controllers/report.controller.js';

const router = Router();

// Two explicit routes instead of an optional param
router.get('/mine', getMyReport);         // current user
router.get('/mine/:userId', getMyReport); // specific user

router.post('/regenerate', regenerateReport);

export default router;