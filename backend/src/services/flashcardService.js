import { AppError } from "../middlewares/errorHandle.js";
import Flashcard from "../models/Flashcard.js";

export const getFlashcardsService = async ({ userId }) => {
  const flashcards = await Flashcard.find({ userId })
    .populate("documentId", "title fileName fileUrl")
    .sort({ createdAt: -1 })
    .lean();

  return flashcards;
};

export const getAllFlashcardSetsService = async ({ userId, documentId }) => {
  const flashcards = await Flashcard.find({ userId, documentId })
    .populate("documentId", "title fileName fileUrl")
    .sort({ createdAt: -1 })
    .lean();

  return flashcards;
};

export const reviewFlashcardService = async ({ userId, cardId }) => {
  const flashcardSet = await Flashcard.findOne({ userId, "cards._id": cardId });
  if (!flashcardSet) {
    throw new AppError("Bộ flashcard không tồn tại", 404);
  }

  const cardIndex = flashcardSet.cards.findIndex(
    (card) => card._id.toString() === cardId
  );
  if (cardIndex === -1) {
    throw new AppError("Flashcard không tồn tại trong bộ", 404);
  }

  // Update review data
  flashcardSet.cards[cardIndex].lastReviewed = Date.now();
  flashcardSet.cards[cardIndex].reviewCount += 1;
  await flashcardSet.save();

  return flashcardSet;
};

export const toggleStarFlashcardService = async ({ userId, cardId }) => {
  const flashcardSet = await Flashcard.findOne({ userId, "cards._id": cardId });
  if (!flashcardSet) {
    throw new AppError("Bộ flashcard không tồn tại", 404);
  }

  const cardIndex = flashcardSet.cards.findIndex(
    (card) => card._id.toString() === cardId
  );
  if (cardIndex === -1) {
    throw new AppError("Flashcard không tồn tại trong bộ", 404);
  }

  // Update review data
  flashcardSet.cards[cardIndex].isStarred =
    !flashcardSet.cards[cardIndex].isStarred;
  await flashcardSet.save();

  return flashcardSet;
};

export const deleteFlashcardSetService = async ({ userId, flashcardId }) => {
  const flashcardSet = await Flashcard.findOne({ userId, _id: flashcardId });
  if (!flashcardSet) {
    throw new AppError("Bộ flashcard không tồn tại", 404);
  }

  await Flashcard.deleteOne({ _id: flashcardId });
  console.log("Đã xóa flashcard:", flashcardId);
};
