import express from "express";
import protect from "@/middlewares/auth.js";
import {
  getFlashcards,
  getAllFlashcardSets,
  getReviewSession,
  reviewFlashcard,
  toggleStarFlashcard,
  deleteFlashcardSet,
  renameFlashcardSet,
  addFlashcardToSet,
  updateFlashcardInSet,
  deleteFlashcardFromSet,
} from "../controllers/flashcardController.js";

const router = express.Router();

router.use(protect);

router.get("/", getFlashcards);

router.get("/review-session", getReviewSession);

router.get("/:documentId", getAllFlashcardSets);

router.post("/:cardId/review", reviewFlashcard);

router.put("/:cardId/star", toggleStarFlashcard);

router.delete("/:flashcardId", deleteFlashcardSet);

router.put("/:setId/rename", renameFlashcardSet);

router.post("/:setId/cards", addFlashcardToSet);

router.put("/:setId/cards/:cardId", updateFlashcardInSet);

router.delete("/:setId/cards/:cardId", deleteFlashcardFromSet);

export default router;
