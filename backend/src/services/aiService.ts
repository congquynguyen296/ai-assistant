import Document from "@/models/Document.js";
import Quiz from "@/models/Quiz.js";
import Flashcard from "@/models/Flashcard.js";
import ChatHistory from "@/models/ChatHistory.js";
import * as geminiUtil from "@/utils/geminiUtil.js";
import { AppError } from "@/middlewares/errorHandle.js";
import { findRelevantChunks, type TextChunk } from "@/utils/textChunker.js";
import { retrieveContext } from "@/services/ragClientService.js";
import { mapFlashcardSet, mapQuiz } from "@/utils/dtoMapper.js";
import type { RagRetrieveResponse } from "@/types/external.js";
import type { FlashcardSetResponseDto } from "@/dtos/flashcards/flashcard.response.dto.js";
import type { QuizResponseDto } from "@/dtos/quiz/quiz.dto.js";

export const generateFlashcardsService = async (input: {
  userId: string;
  documentId: string;
  numFlashcards: number;
  requirements?: string | Record<string, unknown>;
  title?: string;
}): Promise<FlashcardSetResponseDto> => {
  const { userId, documentId, numFlashcards, requirements, title } = input;
  const document = await Document.findOne({
    _id: documentId,
    userId,
    status: "ready",
  });
  if (!document) {
    throw new AppError("Tài liệu không tồn tại", 404);
  }

  const cards = await geminiUtil.generateFlashcards(
    document.extractedText,
    numFlashcards,
    requirements,
  );

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

  return mapFlashcardSet(flashcardSet.toObject());
};

export const generateQuizService = async (input: {
  userId: string;
  documentId: string;
  numQuizzes: number;
  requirements?: string | Record<string, unknown>;
  title?: string;
}): Promise<QuizResponseDto> => {
  const { userId, documentId, numQuizzes, requirements, title } = input;
  const document = await Document.findOne({
    _id: documentId,
    userId,
    status: "ready",
  });
  if (!document) {
    throw new AppError("Tài liệu không tồn tại", 404);
  }

  const questions = await geminiUtil.generateQuiz(
    document.extractedText,
    Number.parseInt(String(numQuizzes), 10),
    requirements,
  );

  const quiz = await Quiz.create({
    userId,
    documentId,
    title: title || `Quiz for ${document.title}`,
    questions,
    totalQuestions: questions.length,
    userAnswer: [],
    score: 0,
  });

  return mapQuiz(quiz.toObject());
};

export const generateSummaryService = async (input: {
  userId: string;
  documentId: string;
  language?: string;
}): Promise<string> => {
  const { userId, documentId, language } = input;
  const document = await Document.findOne({
    _id: documentId,
    userId,
    status: "ready",
  });
  if (!document) {
    throw new AppError("Tài liệu không tồn tại", 404);
  }

  const summary = await geminiUtil.generateSummary(
    document.extractedText,
    language || "VIETNAMESE",
  );

  return summary;
};

export const chatService = async (input: {
  userId: string;
  documentId: string;
  question: string;
}): Promise<Record<string, unknown>> => {
  const { userId, documentId, question } = input;
  const document = await Document.findOne({
    _id: documentId,
    userId,
    status: "ready",
  });

  if (!document) {
    throw new AppError("Tài liệu không tồn tại", 404);
  }

  const ragContext = (await retrieveContext(
    documentId,
    question,
    8,
  )) as RagRetrieveResponse | null;

  let relevantChunks: TextChunk[] | null = null;
  let chunkIndices: number[] = [];
  let contextForGemini: string | null = null;

  if (ragContext) {
    console.log(
      `[chatService] RAG strategy: ${ragContext.strategy_used} — ${ragContext.chunks?.length} chunks`,
    );
    contextForGemini = ragContext.context_text;
    chunkIndices = ragContext.chunks?.map((c) => c.chunk_index) ?? [];
  } else {
    console.log(
      `[chatService] RAG unavailable — falling back to keyword search.`,
    );
    relevantChunks = findRelevantChunks(document.chunks, question, 3);
    chunkIndices = relevantChunks.map((chunk) => chunk.chunkIndex);
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
    },
  );

  await chatHistory.save();

  return {
    question,
    answer,
    relevantChunks: chunkIndices,
    chatHistoryId: chatHistory._id,
  };
};

export const deleteChatService = async (input: {
  userId: string;
  documentId: string;
}): Promise<unknown> => {
  const result = await ChatHistory.deleteOne({
    userId: input.userId,
    documentId: input.documentId,
  });
  return result;
};

export const explainConceptService = async (input: {
  userId: string;
  documentId: string;
  concept: string;
}): Promise<Record<string, unknown>> => {
  const { userId, documentId, concept } = input;
  const document = await Document.findOne({
    _id: documentId,
    userId,
    status: "ready",
  });
  if (!document) {
    throw new AppError("Tài liệu không tồn tại", 404);
  }

  const ragContext = (await retrieveContext(
    documentId,
    concept,
    5,
  )) as RagRetrieveResponse | null;

  let context: string;
  let relevantChunkIndices: number[];

  if (ragContext) {
    console.log(
      `[explainConceptService] RAG strategy: ${ragContext.strategy_used}`,
    );
    context = ragContext.context_text;
    relevantChunkIndices = ragContext.chunks?.map((c) => c.chunk_index) ?? [];
  } else {
    console.log(
      `[explainConceptService] RAG unavailable — falling back to keyword search.`,
    );
    const relevantChunks = findRelevantChunks(document.chunks, concept, 3);
    context = relevantChunks.map((chunk) => chunk.content).join("\n\n");
    relevantChunkIndices = relevantChunks.map((chunk) => chunk.chunkIndex);
  }

  const explanation = await geminiUtil.explainConcept(concept, context);

  return {
    concept,
    explanation,
    revalantChunks: relevantChunkIndices,
  };
};

export const getChatHistoryService = async (input: {
  userId: string;
  documentId: string;
}): Promise<unknown> => {
  const chatHistory = await ChatHistory.findOne({
    userId: input.userId,
    documentId: input.documentId,
  })
    .select("messages")
    .lean();
  return chatHistory;
};
