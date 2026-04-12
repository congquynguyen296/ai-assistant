import Document from "../models/Document.js";
import Quiz from "../models/Quiz.js";
import Flashcard from "../models/Flashcard.js";
import ChatHistory from "../models/ChatHistory.js";
import * as geminiUtil from "../utils/geminiUtil.js";

import { AppError } from "../middlewares/errorHandle.js";
import { findRelevantChunks } from "../utils/textChunker.js";
import { retrieveContext } from "./ragClientService.js";

export const generateFlashcardsService = async ({
  userId,
  documentId,
  numFlashcards,
  requirements,
  title,
}) => {
  const document = await Document.findOne({
    _id: documentId,
    userId,
    status: "ready",
  });
  if (!document) {
    throw new AppError("Tài liệu không tồn tại", 404);
  }

  // Generate flashcards using Gemini API
  const cards = await geminiUtil.generateFlashcards(
    document.extractedText,
    numFlashcards,
    requirements
  );

  // Save to database
  const flashcardSet = await Flashcard.create({
    userId,
    documentId,
    title: title || `Flashcards for ${document.title}`,
    cards: cards.map((card) => ({
      question: card.question,
      answer: card.answer,
      difficulty: card.difficulty,
      reviewCount: 0,
      isStarred: false,
    })),
  });

  return flashcardSet.toObject();
};

export const generateQuizService = async ({
  userId,
  documentId,
  numQuizzes,
  requirements,
  title,
}) => {
  const document = await Document.findOne({
    _id: documentId,
    userId,
    status: "ready",
  });
  if (!document) {
    throw new AppError("Tài liệu không tồn tại", 404);
  }

  // Generate quiz using Gemini API
  const questions = await geminiUtil.generateQuiz(
    document.extractedText,
    parseInt(numQuizzes),
    requirements
  );

  // Save to database
  const quiz = await Quiz.create({
    userId,
    documentId,
    title: title || `Quiz for ${document.title}`,
    questions,
    totalQuestions: questions.length,
    userAnswer: [],
    score: 0,
  });

  return quiz.toObject();
};

export const generateSummaryService = async ({
  userId,
  documentId,
  language,
}) => {
  const document = await Document.findOne({
    _id: documentId,
    userId,
    status: "ready",
  });
  if (!document) {
    throw new AppError("Tài liệu không tồn tại", 404);
  }

  // Generate summary using Gemini API
  const summary = await geminiUtil.generateSummary(
    document.extractedText,
    language || "VIETNAMESE"
  );

  return summary;
};

export const chatService = async ({ userId, documentId, question }) => {
  const document = await Document.findOne({
    _id: documentId,
    userId,
    status: "ready",
  });

  if (!document) {
    throw new AppError("Tài liệu không tồn tại", 404);
  }

  // ── RAG: try semantic retrieval first ──────────────────────────────────────────
  let ragContext = await retrieveContext(documentId, question, 8);

  let relevantChunks;
  let chunkIndices;
  let contextForGemini;

  if (ragContext) {
    // RAG path — semantic search succeeded
    console.log(`[chatService] RAG strategy: ${ragContext.strategy_used} — ${ragContext.chunks?.length} chunks`);
    contextForGemini = ragContext.context_text;
    chunkIndices = ragContext.chunks?.map((c) => c.chunk_index) ?? [];
    relevantChunks = null; // not used in RAG path
  } else {
    // Fallback — Python service down or document not yet indexed
    console.log(`[chatService] RAG unavailable — falling back to keyword search.`);
    relevantChunks = findRelevantChunks(document.chunks, question, 3);
    chunkIndices = relevantChunks.map((chunk) => chunk.chunkIndex);
    contextForGemini = null; // geminiUtil will build context from chunks array
  }

  let chatHistory = await ChatHistory.findOne({
    userId,
    documentId: document._id,
  });

  if (!chatHistory) {
    chatHistory = await ChatHistory.create({
      userId,
      documentId: document._id,
      messages: [],
    });
  }

  // Call Gemini with whichever context path is active
  const answer = ragContext
    ? await geminiUtil.chatWithContext(question, null, contextForGemini)
    : await geminiUtil.chatWithContext(question, relevantChunks);

  chatHistory.messages.push(
    {
      role: "user",
      content: question,
      timestamp: new Date(),
      relevantChunks: [],
    },
    {
      role: "assistant",
      content: answer,
      timestamp: new Date(),
      relevantChunks: chunkIndices,
    }
  );

  await chatHistory.save();

  return {
    question,
    answer,
    relevantChunks: chunkIndices,
    chatHistoryId: chatHistory._id,
  };
};

export const deleteChatService = async ({ userId, documentId }) => {
  const result = await ChatHistory.deleteOne({ userId, documentId });
  return result;
};

export const explainConceptService = async ({
  userId,
  documentId,
  concept,
}) => {
  const document = await Document.findOne({
    _id: documentId,
    userId,
    status: "ready",
  });
  if (!document) {
    throw new AppError("Tài liệu không tồn tại", 404);
  }

  // ── RAG: try semantic retrieval first ──────────────────────────────────────────
  let ragContext = await retrieveContext(documentId, concept, 5);

  let context;
  let relevantChunkIndices;

  if (ragContext) {
    // RAG path
    console.log(`[explainConceptService] RAG strategy: ${ragContext.strategy_used}`);
    context = ragContext.context_text;
    relevantChunkIndices = ragContext.chunks?.map((c) => c.chunk_index) ?? [];
  } else {
    // Fallback — keyword search
    console.log(`[explainConceptService] RAG unavailable — falling back to keyword search.`);
    const relevantChunks = findRelevantChunks(document.chunks, concept, 3);
    context = relevantChunks.map((chunk) => chunk.content).join("\n\n");
    relevantChunkIndices = relevantChunks.map((chunk) => chunk.chunkIndex);
  }

  // Generate explanation using Gemini API
  const explanation = await geminiUtil.explainConcept(concept, context);

  return {
    concept,
    explanation,
    revalantChunks: relevantChunkIndices,
  };
};

export const getChatHistoryService = async ({ userId, documentId }) => {
  const chatHistory = await ChatHistory.findOne({ userId, documentId })
    .select("messages")
    .lean();
  return chatHistory;
};
