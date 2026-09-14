import type { QuizAnswerDto } from "./quiz.response.dto.js";

export interface GetQuizzesRequestDto {
  userId: string;
  documentId: string;
}

export interface GetAllQuizzesRequestDto {
  userId: string;
  page: number;
  size: number;
}

export interface GetQuizByIdRequestDto {
  userId: string;
  quizId: string;
}

export interface SubmitQuizRequestDto {
  userId: string;
  quizId: string;
  answers: QuizAnswerDto[];
}

export interface GetQuizResultsRequestDto {
  userId: string;
  quizId: string;
}

export interface DeleteQuizRequestDto {
  userId: string;
  quizId: string;
}
