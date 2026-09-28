import express from 'express';
import protect from '@/middlewares/auth.js';
import {
  setupInterview,
  chatInterview,
  finishInterview,
  getInterview,
  getTrendingTopics,
  searchTopics,
  getInterviewSessions,
  deleteInterviewSession,
} from '@/controllers/interviewController.js';

import { apiLimiter } from '@/middlewares/rateLimiter.js';

const router = express.Router();

router.use(protect);
router.use(apiLimiter);

// Topics routes
router.get('/topics/trending', getTrendingTopics);
router.get('/topics/search', searchTopics);

// Setup new interview session
router.post('/setup', setupInterview);

// Get list of interview sessions
router.get('/', getInterviewSessions);

// Specific session routes
router.get('/:id', getInterview);
router.post('/:id/chat', chatInterview);
router.post('/:id/finish', finishInterview);
router.delete('/:id', deleteInterviewSession);

export default router;
