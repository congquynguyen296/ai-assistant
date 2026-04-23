import type { DocumentRef } from "@/types/common.js";

export interface QuizQuestionDto {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  difficulty?: "easy" | "medium" | "hard";
}

export interface QuizAnswerDto {
  questionIndex: number;
  selectedAnswer: string;
}

export interface QuizSubmitAnswerDto extends QuizAnswerDto {
  isCorrect: boolean;
  answerAt?: Date;
}

export interface QuizResponseDto {
  _id: string;
  userId: string;
  documentId: DocumentRef;
  title: string;
  questions: QuizQuestionDto[];
  userAnswer: QuizSubmitAnswerDto[];
  score: number;
  totalQuestions: number;
  completedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface QuizResultsResponseDto {
  quiz: {
    quizId: string;
    title: string;
    documentId: string;
    score: number;
    totalQuestions: number;
    completedAt?: Date | null;
  };
  results: Array<{
    questionIndex: number;
    question: string;
    options: string[];
    correctAnswer: string;
    selectedAnswer: string | null;
    isCorrect: boolean;
    explanation?: string;
    difficulty?: "easy" | "medium" | "hard";
  }>;
}

export interface QuizListResponseDto {
  quizzes: QuizResponseDto[];
  pagination: {
    total: number;
    page: number;
    size: number;
    totalPages: number;
  };
}
