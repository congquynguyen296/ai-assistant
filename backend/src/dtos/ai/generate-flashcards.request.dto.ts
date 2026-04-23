export interface GenerateFlashcardsRequestDto {
  documentId: string;
  numFlashcards: number;
  requirements?: string | Record<string, unknown>;
  title?: string;
}
