import express from "express";
import Document from "../models/Document.js";
import Quiz from "../models/Quiz.js";
import Flashcard from "../models/Flashcard.js";
import ChatHistory from "../models/ChatHistory.js";
import * as geminiUtil from "../utils/geminiUtil.js";

import { AppError } from "../middlewares/errorHandle.js";
import { findRelevantChunks } from "../utils/textChunker.js";

export const generateFlashcardsService = async ({
  userId,
  documentId,
  count,
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
    count
  );

  // Save to database
  const flashcardSet = await Flashcard.create({
    userId,
    documentId,
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
  count,
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
    parseInt(count)
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
    throw new AppError("Tài liệu không tồn tại", 404);
  }

  // Find revalant chunks
  const revalantChunks = findRelevantChunks(document.chunks, question, 3);
  const chunkIndices = chunks.map((chunk) => chunk.chunkIndex);

  // Get or create chat history
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

    // Generate answer using Gemini API
    const answer = await geminiUtil.chatWithContext(question, revalantChunks);

    // Save chat message
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
  }
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
    throw new AppError("Tài liệu không tồn tại", 404);
  }

  // Find revalant chunks
  const revalantChunks = findRelevantChunks(document.chunks, concept, 3);
  const context = revalantChunks.map((chunk) => chunk.content).join("\n\n");

  // Generate explanation using Gemini API
  const explanation = await geminiUtil.explainConcept(concept, context);

  return {
    concept,
    explanation,
    revalantChunks: revalantChunks.map((chunk) => chunk.chunkIndex),
  };
};

export const getChatHistoryService = async ({ userId, documentId }) => {
  const chatHistory = await ChatHistory.findOne({ userId, documentId })
    .select("messages")
    .lean();
  return chatHistory;
};
