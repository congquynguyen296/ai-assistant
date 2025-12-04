import { getUserIdFromReq } from "../utils/authUtil.js";
import {
  getQuizzesService,
  getQuizByIdService,
  submitQuizService,
  getQuizResultsService,
  deleteQuizService,
} from "../services/quizService.js";

// @desc    Get quizzes by documentId
// @route   GET /api/v1/quizzes/:documentId
export const getQuizzes = async (req, res, next) => {
  try {
    const userId = getUserIdFromReq(req);

    const documentId = req.params.documentId;
    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: "DocumentId không hợp lệ",
        statusCode: 400,
      });
    }

    const result = await getQuizzesService({ userId, documentId });

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách quiz thành công",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get quiz by quizId
// @route   GET /api/v1/quizzes/quiz/:quizId
export const getQuizById = async (req, res, next) => {
  try {
    const userId = getUserIdFromReq(req);

    const quizId = req.params.quizId;
    if (!quizId) {
      return res.status(400).json({
        success: false,
        error: "QuizID không hợp lệ",
        statusCode: 400,
      });
    }

    const result = await getQuizByIdService({ userId, quizId });

    return res.status(200).json({
      success: true,
      message: "Lấy quiz thành công",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit a quiz
// @route   POST /api/v1/quizzes/:quizId/submit
export const submitQuiz = async (req, res, next) => {
  try {
    const userId = getUserIdFromReq(req);

    const { answers } = req.body;
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        error: "Answers không hợp lệ",
        statusCode: 400,
      });
    }

    const quizId = req.params.quizId;
    if (!quizId) {
      return res.status(400).json({
        success: false,
        error: "QuizID không hợp lệ",
        statusCode: 400,
      });
    }

    const result = await submitQuizService({ userId, quizId, answers });

    return res.status(200).json({
      success: true,
      message: "Nộp bài thành công",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get quiz results
// @route   GET /api/v1/quizzes/:quizId/results
export const getQuizResults = async (req, res, next) => {
  try {
    const userId = getUserIdFromReq(req);

    const quizId = req.params.quizId;
    if (!quizId) {
      return res.status(400).json({
        success: false,
        error: "QuizID không hợp lệ",
        statusCode: 400,
      });
    }

    const result = await getQuizResultsService({ userId, quizId });

    return res.status(200).json({
      success: true,
      message: "Lấy kết quả quiz thành công",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a quiz
// @route   DELETE /api/v1/quizzes/:quizId
export const deleteQuiz = async (req, res, next) => {
  try {
    const userId = getUserIdFromReq(req);

    const quizId = req.params.quizId;
    if (!quizId) {
      return res.status(400).json({
        success: false,
        error: "QuizID không hợp lệ",
        statusCode: 400,
      });
    }

    await deleteQuizService({ userId, quizId });

    return res.status(200).json({
      success: true,
      message: "Xóa quiz thành công",
    });
  } catch (error) {
    next(error);
  }
};
