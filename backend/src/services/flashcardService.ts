import { AppError } from "@/middlewares/errorHandle.js";
import Flashcard from "@/models/Flashcard.js";
import { mapFlashcardSet } from "@/utils/dtoMapper.js";
import type { FlashcardSetResponseDto } from "@/dtos/flashcards/flashcard.response.dto.js";
import FlashcardReviewLog from "@/models/FlashcardReviewLog.js";
import { calculateNextReview } from "@/utils/srsAlgorithm.js";
import type {
  GetFlashcardsRequestDto,
  GetAllFlashcardSetsRequestDto,
  GetReviewSessionRequestDto,
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

export const getReviewSessionService = async (
  input: GetReviewSessionRequestDto
): Promise<any[]> => {
  // Lấy timezone bù trừ so với UTC. Ví dụ: +07:00 là -420 phút.
  const now = new Date();
  
  // Tính endOfDay theo timezone của client
  // Múi giờ của client: local = utc - timezoneOffset
  // endOfDay của ngày hiện tại (theo local) -> chuyển về UTC
  // Rất đơn giản: start of next day in local time - 1 ms
  const utcNowMs = now.getTime();
  const localTimeMs = utcNowMs - (input.timezoneOffset * 60 * 1000);
  const localDate = new Date(localTimeMs);
  
  localDate.setUTCHours(23, 59, 59, 999);
  
  // Convert end of local day back to UTC
  const endOfDayUtcMs = localDate.getTime() + (input.timezoneOffset * 60 * 1000);
  const endOfDay = new Date(endOfDayUtcMs);

  const query: any = { userId: input.userId };
  if (input.documentId) {
    query.documentId = input.documentId;
  }
  const flashcardSets = await Flashcard.find(query).lean();

  const sessionCards: any[] = [];
  
  for (const set of flashcardSets) {
    for (const card of set.cards as any[]) {
      if (
        card.status === "new" ||
        (card.nextReviewDate && new Date(card.nextReviewDate) <= endOfDay)
      ) {
        sessionCards.push({
          ...card,
          flashcardSetId: set._id,
          documentId: set.documentId,
          setTitle: set.title,
        });
      }
    }
  }

  // Shuffle hoặc ưu tiên thẻ learning
  return sessionCards.sort((a, b) => {
    if (a.status === "learning" && b.status !== "learning") return -1;
    if (a.status !== "learning" && b.status === "learning") return 1;
    return 0; // Giữ nguyên thứ tự nếu cùng nhóm
  });
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

  const targetCard = flashcardSet.cards[cardIndex];
  
  // Lấy giá trị cũ hoặc gán default nếu undefined
  const oldInterval = targetCard.interval ?? 0;
  const oldEaseFactor = targetCard.easeFactor ?? 2.5;
  const oldStatus = targetCard.status || "new";
  const oldRepetitionCount = targetCard.reviewCount ?? 0;

  // Tính toán bước tiếp theo theo thuật toán SRS V5
  const srsResult = calculateNextReview(
    input.grade,
    oldInterval,
    oldEaseFactor,
    oldStatus,
    oldRepetitionCount
  );

  // Cập nhật ngày kế tiếp
  const now = new Date();
  let nextReviewDate = new Date();
  if (srsResult.interval > 0) {
    nextReviewDate = new Date(now.getTime() + srsResult.interval * 24 * 60 * 60 * 1000);
  }

  flashcardSet.cards[cardIndex].status = srsResult.status;
  flashcardSet.cards[cardIndex].interval = srsResult.interval;
  flashcardSet.cards[cardIndex].easeFactor = srsResult.easeFactor;
  flashcardSet.cards[cardIndex].reviewCount = srsResult.repetitionCount;
  flashcardSet.cards[cardIndex].nextReviewDate = nextReviewDate;
  flashcardSet.cards[cardIndex].lastReviewed = now;

  await flashcardSet.save();

  // Lưu Log
  await FlashcardReviewLog.create({
    userId: input.userId,
    flashcardSetId: flashcardSet._id,
    cardId: targetCard._id,
    grade: input.grade,
    oldInterval: oldInterval,
    newInterval: srsResult.interval,
    oldEaseFactor: oldEaseFactor,
    newEaseFactor: srsResult.easeFactor,
    reviewedAt: now,
  });

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
