import {
  generateFlashcardsService,
  generateQuizService,
  generateSummaryService,
  chatService,
  explainConceptService,
  getChatHistoryService,
} from "../services/aiService.js";

// @desc    Generate flashcards from a document
// @route   POST /api/v1/ai-generation/generate-flashcards
export const generateFlashcards = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { documentId, count = 10 } = req.body;
    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: "DocumentId không hợp lệ",
        statusCode: 400,
      });
    }

    const result = await generateFlashcardsService({
      userId,
      documentId,
      count,
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

// @desc    Generate quiz from a document
// @route   POST /api/v1/ai-generation/generate-quiz
export const generateQuiz = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { documentId, count = 5, title } = req.body;
    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: "DocumentId không hợp lệ",
        statusCode: 400,
      });
    }

    const result = await generateQuizService({
      userId,
      documentId,
      count,
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

// @desc    Generate summary from a document
// @route   POST /api/v1/ai-generation/generate-summary
export const generateSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { documentId, language } = req.body;
    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: "DocumentId không hợp lệ",
        statusCode: 400,
      });
    }

    const result = await generateSummaryService({
      userId,
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

// @desc    Chat with AI about documents
// @route   POST /api/v1/ai-generation/chat
export const chat = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { documentId, question } = req.body;
    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: "DocumentId không hợp lệ",
        statusCode: 400,
      });
    }

    const result = await chatService({
      userId,
      documentId,
      question,
    });

    return res.status(200).json({
      success: true,
      message: "Chat với AI thành công",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Explain a concept
// @route   POST /api/v1/ai-generation/explain-concept
export const explainConcept = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { documentId, concept } = req.body;
    if (!documentId || concept) {
      return res.status(400).json({
        success: false,
        error: "DocumentId hoặc concept không hợp lệ",
        statusCode: 400,
      });
    }

    const result = await explainConceptService({
      userId,
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

// @desc    Get chat history
// @route   GET /api/v1/ai-generation/chat-history
export const getChatHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { documentId } = req.body;
    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: "DocumentId không hợp lệ",
        statusCode: 400,
      });
    }

    const result = await getChatHistoryService({
      userId,
      documentId,
    });

    return res.status(200).json({
      success: true,
      message: "Lấy lịch sử chat thành công",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
