import type { Response, NextFunction } from "express";
import {
  generateFlashcardsService,
  generateQuizService,
  generateSummaryService,
  chatService,
  explainConceptService,
  getChatHistoryService,
  deleteChatService,
} from "../services/aiService.js";
import type { AuthRequest } from "@/types/request.js";
import type { GenerateFlashcardsRequestDto } from "@/dtos/ai/generate-flashcards.request.dto.js";
import type { GenerateQuizRequestDto } from "@/dtos/ai/generate-quiz.request.dto.js";
import type { GenerateSummaryRequestDto } from "@/dtos/ai/generate-summary.request.dto.js";
import type { ChatRequestDto } from "@/dtos/ai/chat.request.dto.js";
import type { ExplainConceptRequestDto } from "@/dtos/ai/explain-concept.request.dto.js";

export const generateFlashcards = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const userId = req.user?.id;
    const { documentId, numFlashcards, requirements, title } =
      req.body as GenerateFlashcardsRequestDto;
    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: "DocumentId không hợp lệ",
        statusCode: 400,
      });
    }

    const result = await generateFlashcardsService({
      userId: userId as string,
      documentId,
      numFlashcards,
      requirements,
      title,
    });

    return res.status(201).json({
      success: true,
      message: "Tạo flashcard thành công",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const generateQuiz = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const userId = req.user?.id;
    const { documentId, numQuizzes, requirements, title } =
      req.body as GenerateQuizRequestDto;
    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: "DocumentId không hợp lệ",
        statusCode: 400,
      });
    }

    const result = await generateQuizService({
      userId: userId as string,
      documentId,
      numQuizzes,
      requirements,
      title,
    });

    return res.status(201).json({
      success: true,
      message: "Tạo quiz thành công",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const generateSummary = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const userId = req.user?.id;
    const { documentId, language } = req.body as GenerateSummaryRequestDto;
    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: "DocumentId không hợp lệ",
        statusCode: 400,
      });
    }

    const result = await generateSummaryService({
      userId: userId as string,
      documentId,
      language,
    });

    return res.status(201).json({
      success: true,
      message: "Tạo summary thành công",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const chat = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const userId = req.user?.id;
    const { documentId, question } = req.body as ChatRequestDto;
    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: "DocumentId không hợp lệ",
        statusCode: 400,
      });
    }

    const result = await chatService({
      userId: userId as string,
      documentId,
      question,
    });

    console.log(result);

    return res.status(200).json({
      success: true,
      message: "Chat với AI thành công",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const explainConcept = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const userId = req.user?.id;
    const { documentId, concept } = req.body as ExplainConceptRequestDto;
    if (!documentId || !concept) {
      return res.status(400).json({
        success: false,
        error: "DocumentId hoặc concept không hợp lệ",
        statusCode: 400,
      });
    }

    const result = await explainConceptService({
      userId: userId as string,
      documentId,
      concept,
    });

    return res.status(200).json({
      success: true,
      message: "Giải thích khái niệm thành công",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getChatHistory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const userId = req.user?.id;
    const { documentId } = req.query as { documentId?: string };
    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: "DocumentId không hợp lệ",
        statusCode: 400,
      });
    }

    const result = await getChatHistoryService({
      userId: userId as string,
      documentId,
    });

    return res.status(200).json({
      success: true,
      message: "Lấy lịch sử chat thành công",
      data: (result as { messages?: unknown[] } | null)?.messages || [],
    });
  } catch (error) {
    next(error);
  }
};

export const deleteChatHistory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const userId = req.user?.id;
    const { documentId } = req.query as { documentId?: string };
    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: "DocumentId không hợp lệ",
        statusCode: 400,
      });
    }

    await deleteChatService({
      userId: userId as string,
      documentId,
    });

    return res.status(200).json({
      success: true,
      message: "Xóa lịch sử chat thành công",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
