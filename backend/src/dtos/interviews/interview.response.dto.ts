export interface ChatInterviewResponseDto {
  question: string;
  isFinished: boolean; // True if maxQuestions reached and session is forced to complete
}
