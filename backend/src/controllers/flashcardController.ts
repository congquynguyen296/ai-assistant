import type { Response, NextFunction } from "express";
import {
  getFlashcardsService,
  getAllFlashcardSetsService,
  reviewFlashcardService,
  toggleStarFlashcardService,
  deleteFlashcardSetService,
  renameFlashcardSetService,
  addFlashcardToSetService,
  updateFlashcardInSetService,
  deleteFlashcardFromSetService,
} from "../services/flashcardService.js";
import { getUserIdFromReq } from "@/utils/authUtil.js";
import type { AuthRequest } from "@/dtos/common/request.dto.js";
import { Difficulty } from "@/types/enums.js";

export const getFlashcards = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const userId = getUserIdFromReq(req);
    const flashcards = await getFlashcardsService({ userId });

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách flashcard thành công",
      data: flashcards,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllFlashcardSets = async (
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

    const result = await getAllFlashcardSetsService({ userId, documentId });

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách flashcard thành công",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const reviewFlashcard = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const userId = getUserIdFromReq(req);
    const cardId = req.params.cardId;
    if (!cardId) {
      return res.status(400).json({
        sucess: false,
        error: "CardId không hợp lệ",
        statusCode: 400,
      });
    }

    const result = await reviewFlashcardService({ userId, cardId });

    return res.status(200).json({
      success: true,
      message: "Review flashcard thành công",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleStarFlashcard = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const userId = getUserIdFromReq(req);
    const cardId = req.params.cardId;
    if (!cardId) {
      return res.status(400).json({
        sucess: false,
        error: "CardId không hợp lệ",
        statusCode: 400,
      });
    }

    const result = await toggleStarFlashcardService({ userId, cardId });

    return res.status(200).json({
      success: true,
      message: "Cập nhật thành công trạng thái star của flashcard",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteFlashcardSet = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const userId = getUserIdFromReq(req);
    const flashcardId = req.params.flashcardId;
    if (!flashcardId) {
      return res.status(400).json({
        sucess: false,
        error: "FlashcardId không hợp lệ",
        statusCode: 400,
      });
    }
    await deleteFlashcardSetService({ userId, flashcardId });
    return res.status(200).json({
      success: true,
      message: "Xóa bộ flashcard thành công",
    });
  } catch (error) {
    next(error);
  }
};

export const renameFlashcardSet = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const userId = getUserIdFromReq(req);
    const flashcardId = req.params.setId;
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        error: "Tiêu đề không được để trống",
        statusCode: 400,
      });
    }

    const result = await renameFlashcardSetService({ userId, flashcardId, title });
    return res.status(200).json({
      success: true,
      message: "Đổi tên bộ flashcard thành công",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const addFlashcardToSet = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const userId = getUserIdFromReq(req);
    const flashcardId = req.params.setId;
    const { question, answer, difficulty } = req.body;

    if (!question || !answer) {
      return res.status(400).json({
        success: false,
        error: "Câu hỏi và câu trả lời không được để trống",
        statusCode: 400,
      });
    }

    const result = await addFlashcardToSetService({
      userId,
      flashcardId,
      question,
      answer,
      difficulty: difficulty || Difficulty.MEDIUM,
    });

    return res.status(200).json({
      success: true,
      message: "Thêm thẻ flashcard thành công",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateFlashcardInSet = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const userId = getUserIdFromReq(req);
    const flashcardId = req.params.setId;
    const cardId = req.params.cardId;
    const { question, answer, difficulty } = req.body;

    if (!question || !answer) {
      return res.status(400).json({
        success: false,
        error: "Câu hỏi và câu trả lời không được để trống",
        statusCode: 400,
      });
    }

    const result = await updateFlashcardInSetService({
      userId,
      flashcardId,
      cardId,
      question,
      answer,
      difficulty: difficulty || Difficulty.MEDIUM,
    });

    return res.status(200).json({
      success: true,
      message: "Cập nhật thẻ flashcard thành công",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteFlashcardFromSet = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const userId = getUserIdFromReq(req);
    const flashcardId = req.params.setId;
    const cardId = req.params.cardId;

    const result = await deleteFlashcardFromSetService({ userId, flashcardId, cardId });

    return res.status(200).json({
      success: true,
      message: "Xóa thẻ flashcard thành công",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
