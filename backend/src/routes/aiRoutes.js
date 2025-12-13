import express from "express";
import protect from "../middlewares/auth.js";
import {
  generateFlashcards,
  generateQuiz,
  generateSummary,
  chat,
  explainConcept,
  getChatHistory,
  deleteChatHistory,
} from "../controllers/aiController.js";

const router = express.Router();

// All routes are protected
router.use(protect);

router.post("/generate-flashcards", generateFlashcards);

router.post("/generate-quiz", generateQuiz);

router.post("/generate-summary", generateSummary);

router.post("/chat", chat);

router.post("/explain-concept", explainConcept);

router.get("/chat-history", getChatHistory);

router.delete("/chat-history", deleteChatHistory);

export default router;
