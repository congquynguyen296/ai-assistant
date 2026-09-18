import express from 'express';
import protect from '@/middlewares/auth.js';
import {
  setupInterview,
  chatInterview,
  finishInterview,
  getInterview,
  getTrendingTopics,
  getInterviewSessions,
  deleteInterviewSession,
} from '@/controllers/interviewController.js';

const router = express.Router();

// Trending topics does not require full session, but might require auth
router.get('/topics/trending', protect, getTrendingTopics);

// Setup new interview session
router.post('/setup', protect, setupInterview);

// Get list of interview sessions
router.get('/', protect, getInterviewSessions);

// Specific session routes
router.get('/:id', protect, getInterview);
router.post('/:id/chat', protect, chatInterview);
router.post('/:id/finish', protect, finishInterview);
router.delete('/:id', protect, deleteInterviewSession);

export default router;
