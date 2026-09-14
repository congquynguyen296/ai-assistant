import { AppError } from "@/middlewares/errorHandle.js";
import Flashcard from "@/models/Flashcard.js";
import { mapFlashcardSet } from "@/utils/dtoMapper.js";
import type { FlashcardSetResponseDto } from "@/dtos/flashcards/flashcard.response.dto.js";
import type {
  GetFlashcardsRequestDto,
  GetAllFlashcardSetsRequestDto,
  ReviewFlashcardRequestDto,
  ToggleStarFlashcardRequestDto,
  DeleteFlashcardSetRequestDto,
  RenameFlashcardSetRequestDto,
  AddFlashcardToSetRequestDto,
  UpdateFlashcardInSetRequestDto,
  DeleteFlashcardFromSetRequestDto,
} from "@/dtos/flashcards/flashcard.request.dto.js";

export const getFlashcardsService = async (
  input: GetFlashcardsRequestDto
): Promise<FlashcardSetResponseDto[]> => {
  const flashcards = await Flashcard.find({ userId: input.userId })
    .populate("documentId", "title fileName fileUrl")
    .sort({ createdAt: -1 })
    .lean();

  return (flashcards as unknown as Record<string, unknown>[]).map((flashcard) =>
    mapFlashcardSet(flashcard),
  );
};

export const getAllFlashcardSetsService = async (
  input: GetAllFlashcardSetsRequestDto
): Promise<FlashcardSetResponseDto[]> => {
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

export const reviewFlashcardService = async (
  input: ReviewFlashcardRequestDto
): Promise<FlashcardSetResponseDto> => {
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

export const toggleStarFlashcardService = async (
  input: ToggleStarFlashcardRequestDto
): Promise<FlashcardSetResponseDto> => {
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

export const deleteFlashcardSetService = async (
  input: DeleteFlashcardSetRequestDto
): Promise<void> => {
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

export const renameFlashcardSetService = async (
  input: RenameFlashcardSetRequestDto
): Promise<FlashcardSetResponseDto> => {
  const flashcardSet = await Flashcard.findOneAndUpdate(
    { _id: input.flashcardId, userId: input.userId },
    { $set: { title: input.title } },
    { returnDocument: 'after' }
  ).populate("documentId", "title fileName fileUrl").lean();

  if (!flashcardSet) {
    throw new AppError("Bộ flashcard không tồn tại", 404);
  }

  return mapFlashcardSet(flashcardSet as any);
};

export const addFlashcardToSetService = async (
  input: AddFlashcardToSetRequestDto
): Promise<FlashcardSetResponseDto> => {
  const flashcardSet = await Flashcard.findOneAndUpdate(
    { _id: input.flashcardId, userId: input.userId },
    {
      $push: {
        cards: {
          question: input.question,
          answer: input.answer,
          difficulty: input.difficulty,
          reviewCount: 0,
          isStarred: false,
        },
      },
    },
    { returnDocument: 'after' }
  ).populate("documentId", "title fileName fileUrl").lean();

  if (!flashcardSet) {
    throw new AppError("Bộ flashcard không tồn tại", 404);
  }

  return mapFlashcardSet(flashcardSet as any);
};

export const updateFlashcardInSetService = async (
  input: UpdateFlashcardInSetRequestDto
): Promise<FlashcardSetResponseDto> => {
  const flashcardSet = await Flashcard.findOneAndUpdate(
    { _id: input.flashcardId, userId: input.userId, "cards._id": input.cardId },
    {
      $set: {
        "cards.$.question": input.question,
        "cards.$.answer": input.answer,
        "cards.$.difficulty": input.difficulty,
      },
    },
    { returnDocument: 'after' }
  ).populate("documentId", "title fileName fileUrl").lean();

  if (!flashcardSet) {
    throw new AppError("Bộ flashcard không tồn tại hoặc thẻ không thuộc về bộ này", 404);
  }

  return mapFlashcardSet(flashcardSet as any);
};

export const deleteFlashcardFromSetService = async (
  input: DeleteFlashcardFromSetRequestDto
): Promise<FlashcardSetResponseDto> => {
  const flashcardSet = await Flashcard.findOneAndUpdate(
    { _id: input.flashcardId, userId: input.userId },
    {
      $pull: {
        cards: { _id: input.cardId },
      },
    },
    { returnDocument: 'after' }
  ).populate("documentId", "title fileName fileUrl").lean();

  if (!flashcardSet) {
    throw new AppError("Bộ flashcard không tồn tại", 404);
  }

  return mapFlashcardSet(flashcardSet as any);
};
