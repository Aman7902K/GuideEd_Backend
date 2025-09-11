import { Router } from 'express';
import {
  startAssessment,
  submitAnswer,
  finalizeAssessment,
  getAttempt
} from '../controllers/assessment.controller.js';

const router = Router();

// POST /api/assessment/start
router.post('/start', startAssessment);

// POST /api/assessment/answer
router.post('/answer', submitAnswer);

// POST /api/assessment/finalize
router.post('/finalize', finalizeAssessment);

// GET /api/assessment/attempt/:id
router.get('/attempt/:id', getAttempt);

export default router;