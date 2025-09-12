import express from 'express';
import {
  startAssessment,
  submitAnswer,
  finalizeAssessment,
  getAttempt
} from '../controllers/assessment.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Protect all assessment routes
router.use(requireAuth);

router.post('/start', startAssessment);
router.post('/answer', submitAnswer);
router.post('/finalize', finalizeAssessment);
router.get('/:id', getAttempt);

export default router;