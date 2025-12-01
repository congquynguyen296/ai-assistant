import express from "express";
import protect from "../middlewares/auth.js";
import {
  getFlashcards,
  getAllFlashcardSets,
  reviewFlashcard,
  toggleStarFlashcard,
  deleteFlashcardSet,
} from "../controllers/flashcardController.js";

const router = express.Router();

// All routes are protected
router.use(protect);

router.get("/", getFlashcards);

router.get("/:documentId", getAllFlashcardSets);

router.post("/:cardId/review", reviewFlashcard);

router.put("/:cardId/star", toggleStarFlashcard);

router.delete("/:flashcardId", deleteFlashcardSet);

export default router;
