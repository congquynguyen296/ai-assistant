import type { Response, NextFunction } from "express";
import {
  getFlashcardsService,
  getAllFlashcardSetsService,
  reviewFlashcardService,
  toggleStarFlashcardService,
  deleteFlashcardSetService,
} from "../services/flashcardService.js";
import { getUserIdFromReq } from "@/utils/authUtil.js";
import type { AuthRequest } from "@/types/request.js";

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
