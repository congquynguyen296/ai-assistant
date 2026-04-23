import { AppError } from "@/middlewares/errorHandle.js";
import Flashcard from "@/models/Flashcard.js";
import { mapFlashcardSet } from "@/utils/dtoMapper.js";
import type { FlashcardSetResponseDto } from "@/dtos/flashcards/flashcard.response.dto.js";

export const getFlashcardsService = async (input: {
  userId: string;
}): Promise<FlashcardSetResponseDto[]> => {
  const flashcards = await Flashcard.find({ userId: input.userId })
    .populate("documentId", "title fileName fileUrl")
    .sort({ createdAt: -1 })
    .lean();

  return (flashcards as unknown as Record<string, unknown>[]).map((flashcard) =>
    mapFlashcardSet(flashcard),
  );
};

export const getAllFlashcardSetsService = async (input: {
  userId: string;
  documentId: string;
}): Promise<FlashcardSetResponseDto[]> => {
  const flashcards = await Flashcard.find({
    userId: input.userId,
    documentId: input.documentId,
  })
    .populate("documentId", "title fileName fileUrl")
    .sort({ createdAt: -1 })
    .lean();

  return (flashcards as unknown as Record<string, unknown>[]).map((flashcard) =>
    mapFlashcardSet(flashcard),
  );
};

export const reviewFlashcardService = async (input: {
  userId: string;
  cardId: string;
}): Promise<FlashcardSetResponseDto> => {
  const flashcardSet = await Flashcard.findOne({
    userId: input.userId,
    "cards._id": input.cardId,
  });
  if (!flashcardSet) {
    throw new AppError("Bộ flashcard không tồn tại", 404);
  }

  const cardIndex = flashcardSet.cards.findIndex(
    (card) => card._id?.toString() === input.cardId,
  );
  if (cardIndex === -1) {
    throw new AppError("Flashcard không tồn tại trong bộ", 404);
  }

  flashcardSet.cards[cardIndex].lastReviewed = new Date();
  flashcardSet.cards[cardIndex].reviewCount += 1;
  await flashcardSet.save();

  return mapFlashcardSet(flashcardSet.toObject());
};

export const toggleStarFlashcardService = async (input: {
  userId: string;
  cardId: string;
}): Promise<FlashcardSetResponseDto> => {
  const flashcardSet = await Flashcard.findOne({
    userId: input.userId,
    "cards._id": input.cardId,
  });
  if (!flashcardSet) {
    throw new AppError("Bộ flashcard không tồn tại", 404);
  }

  const cardIndex = flashcardSet.cards.findIndex(
    (card) => card._id?.toString() === input.cardId,
  );
  if (cardIndex === -1) {
    throw new AppError("Flashcard không tồn tại trong bộ", 404);
  }

  flashcardSet.cards[cardIndex].isStarred =
    !flashcardSet.cards[cardIndex].isStarred;
  await flashcardSet.save();

  return mapFlashcardSet(flashcardSet.toObject());
};

export const deleteFlashcardSetService = async (input: {
  userId: string;
  flashcardId: string;
}): Promise<void> => {
  const flashcardSet = await Flashcard.findOne({
    userId: input.userId,
    _id: input.flashcardId,
  });
  if (!flashcardSet) {
    throw new AppError("Bộ flashcard không tồn tại", 404);
  }

  await Flashcard.deleteOne({ _id: input.flashcardId });
  console.log("Đã xóa flashcard:", input.flashcardId);
};
