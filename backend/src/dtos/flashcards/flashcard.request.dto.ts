import { Difficulty } from "@/types/enums.js";

export interface GetFlashcardsRequestDto {
  userId: string;
}

export interface GetAllFlashcardSetsRequestDto {
  userId: string;
  documentId: string;
}

export interface ReviewFlashcardRequestDto {
  userId: string;
  cardId: string;
}

export interface ToggleStarFlashcardRequestDto {
  userId: string;
  cardId: string;
}

export interface DeleteFlashcardSetRequestDto {
  userId: string;
  flashcardId: string;
}

export interface RenameFlashcardSetRequestDto {
  userId: string;
  flashcardId: string;
  title: string;
}

export interface AddFlashcardToSetRequestDto {
  userId: string;
  flashcardId: string;
  question: string;
  answer: string;
  difficulty: Difficulty;
}

export interface UpdateFlashcardInSetRequestDto {
  userId: string;
  flashcardId: string;
  cardId: string;
  question: string;
  answer: string;
  difficulty: Difficulty;
}

export interface DeleteFlashcardFromSetRequestDto {
  userId: string;
  flashcardId: string;
  cardId: string;
}
