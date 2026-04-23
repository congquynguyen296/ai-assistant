import type { QuizAnswerDto } from "@/dtos/quiz/quiz.dto.js";

export interface SubmitQuizRequestDto {
  answers: QuizAnswerDto[];
}
