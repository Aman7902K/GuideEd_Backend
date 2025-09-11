import { Router } from 'express';
import {
  startAssessment,
  submitAnswer,
  finalizeAssessment,
  getAttempt
} from '../controllers/assessment.controller.js';

const router = Router();

// These paths are relative to how you mount the router in app.js
router.post('/start', startAssessment);
router.post('/answer', submitAnswer);
router.post('/finalize', finalizeAssessment);
router.get('/attempt/:id', getAttempt);

export default router;