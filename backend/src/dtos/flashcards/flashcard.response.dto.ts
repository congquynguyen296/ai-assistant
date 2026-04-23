import type { DocumentRef } from "@/types/common.js";

export interface FlashcardCardDto {
  _id?: string;
  question: string;
  answer: string;
  difficulty: "easy" | "medium" | "hard";
  lastReviewed?: Date | null;
  reviewCount: number;
  isStarred: boolean;
}

export interface FlashcardSetResponseDto {
  _id: string;
  userId: string;
  documentId: DocumentRef;
  title: string;
  cards: FlashcardCardDto[];
  createdAt?: Date;
  updatedAt?: Date;
}
