import {
  getFlashcardsService,
  getAllFlashcardSetsService,
  reviewFlashcardService,
  toggleStarFlashcardService,
  deleteFlashcardSetService,
} from "../services/flashcardService.js";
import { getUserIdFromReq } from "../utils/authUtil.js";

// @desc    Get flashcards with filters
// @route   GET /api/v1/flashcards
export const getFlashcards = async (req, res, next) => {
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

// @desc    Get all flashcard sets by documentId
// @route   GET /api/v1/flashcards/:documentId
export const getAllFlashcardSets = async (req, res, next) => {
  try {
    const userId = getUserIdFromReq(req);
    const documentId = req.params.documentId;
    if (!documentId) {
      return res.status(400).jsom({
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

// @desc    Review a flashcard
// @route   POST /api/v1/flashcards/:cardId/review
export const reviewFlashcard = async (req, res, next) => {
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

// @desc    Toggle star a flashcard
// @route   PUT /api/v1/flashcards/:cardId/star
export const toggleStarFlashcard = async (req, res, next) => {
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
      message: `Cập nhật thành công trạng thái star của flashcard`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a flashcard set
// @route   DELETE /api/v1/flashcards/:flashcardId
export const deleteFlashcardSet = async (req, res, next) => {
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
