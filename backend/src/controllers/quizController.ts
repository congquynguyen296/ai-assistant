import type { Response, NextFunction } from "express";
import { getUserIdFromReq } from "@/utils/authUtil.js";
import {
  getQuizzesService,
  getAllQuizzesService,
  getQuizByIdService,
  submitQuizService,
  getQuizResultsService,
  deleteQuizService,
} from "../services/quizService.js";
import type { AuthRequest } from "@/types/request.js";
import type { SubmitQuizRequestDto } from "@/dtos/quiz/submit-quiz.request.dto.js";

export const getAllQuizzes = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const userId = getUserIdFromReq(req);

    const page = Number.parseInt(String(req.query.page ?? 1), 10) || 1;
    const size = Number.parseInt(String(req.query.size ?? 10), 10) || 10;

    const result = await getAllQuizzesService({ userId, page, size });

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách quiz thành công",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getQuizzes = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
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

export const getQuizById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
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

export const submitQuiz = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const userId = getUserIdFromReq(req);

    const { answers } = req.body as SubmitQuizRequestDto;
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
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

export const getQuizResults = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
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

export const deleteQuiz = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
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
