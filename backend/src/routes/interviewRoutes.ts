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

const router = express.Router();

// Topics routes
router.get('/topics/trending', protect, getTrendingTopics);
router.get('/topics/search', protect, searchTopics);

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
