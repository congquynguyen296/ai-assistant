export interface GenerateQuizRequestDto {
  documentId: string;
  numQuizzes: number;
  requirements?: string | Record<string, unknown>;
  title?: string;
}
