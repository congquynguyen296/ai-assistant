import type { Document, Types } from "mongoose";
import { InterviewMode, InterviewStatus, InterviewQuestionSource } from "./enums.js";

export interface UserDocument extends Document {
  id: string;
  username: string;
  email: string;
  password?: string;
  googleId?: string | null;
  profileImage?: string | null;
  createdAt: Date;
  updatedAt: Date;
  matchPassword: (enteredPassword: string) => Promise<boolean>;
}

export interface DocumentChunk {
  content: string;
  pageNumber: number;
  chunkIndex: number;
  _id?: Types.ObjectId;
}

export interface DocumentDocument extends Document {
  userId: Types.ObjectId;
  title: string;
  fileName: string;
  filePath: string;
  fileUrl?: string | null;
  mimeType?: string;
  fileSize: number;
  extractedText: string;
  chunks: DocumentChunk[];
  uploadDate: Date;
  status?: "processing" | "ready" | "failed";
  lastAccessed: Date;
  createdAt: Date;
  updatedAt: Date;
}

import { Difficulty } from "./enums.js";

export interface FlashcardCard {
  question: string;
  answer: string;
  difficulty: Difficulty;
  lastReviewed?: Date | null;
  reviewCount: number;
  isStarred: boolean;
  _id?: Types.ObjectId;
}

export interface FlashcardDocument extends Document {
  userId: Types.ObjectId;
  documentId: Types.ObjectId;
  title: string;
  cards: FlashcardCard[];
  createdAt: Date;
  updatedAt: Date;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  difficulty?: Difficulty;
}

export interface QuizUserAnswer {
  questionIndex: number;
  selectedAnswer: string;
  isCorrect: boolean;
  answerAt: Date;
}

export interface QuizDocument extends Document {
  userId: Types.ObjectId;
  documentId: Types.ObjectId;
  title: string;
  questions: QuizQuestion[];
  userAnswer: QuizUserAnswer[];
  score: number;
  totalQuestions: number;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatHistoryMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  relevantChunks: number[];
}

export interface ChatHistoryDocument extends Document {
  userId: Types.ObjectId;
  documentId: Types.ObjectId;
  messages: ChatHistoryMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPublicDto {
  id: string;
  username: string;
  email: string;
  profileImage?: string | null;
}

export interface InterviewMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface InterviewSessionDocument extends Document {
  userId: Types.ObjectId;
  mode: InterviewMode;
  status: InterviewStatus;
  documentIds: Types.ObjectId[];
  topicId?: Types.ObjectId;
  blueprint?: Record<string, unknown>;
  messages: InterviewMessage[];
  report?: Record<string, unknown>;
  maxQuestions: number;
  questionsAsked: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface InterviewTopicDocument extends Document {
  name: string;
  usageCount: number;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InterviewQuestionDocument extends Document {
  topicId: Types.ObjectId;
  question: string;
  difficulty: Difficulty;
  source: InterviewQuestionSource;
  expectedAnswerContext?: string;
  createdAt: Date;
  updatedAt: Date;
}
