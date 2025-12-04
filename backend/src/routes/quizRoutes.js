import express from "express";
import protect from "../middlewares/auth.js";
import {
    getQuizzes,
    getQuizById,
    submitQuiz,
    getQuizResults,
    deleteQuiz
} from "../controllers/quizController.js";

const router = express.Router();

router.use(protect);

router.get("/:documentId", getQuizzes);

router.get("/quiz/:quizId", getQuizById);

router.post("/:quizId/submit", submitQuiz);

router.get("/:quizId/results", getQuizResults);

router.delete("/:quizId", deleteQuiz);

export default router;