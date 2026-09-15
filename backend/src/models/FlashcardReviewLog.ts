import { Schema, model, Types, Document } from "mongoose";

export interface FlashcardReviewLogDocument extends Document {
  userId: Types.ObjectId;
  flashcardSetId: Types.ObjectId;
  cardId: Types.ObjectId;
  grade: number; // 1: Quên, 2: Khó, 3: Tốt, 4: Dễ
  oldInterval: number;
  newInterval: number;
  oldEaseFactor: number;
  newEaseFactor: number;
  reviewedAt: Date;
}

const flashcardReviewLogSchema = new Schema<FlashcardReviewLogDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  flashcardSetId: {
    type: Schema.Types.ObjectId,
    ref: "Flashcard",
    required: true,
  },
  cardId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  grade: {
    type: Number,
    required: true,
    enum: [1, 2, 3, 4],
  },
  oldInterval: {
    type: Number,
    required: true,
  },
  newInterval: {
    type: Number,
    required: true,
  },
  oldEaseFactor: {
    type: Number,
    required: true,
  },
  newEaseFactor: {
    type: Number,
    required: true,
  },
  reviewedAt: {
    type: Date,
    default: Date.now,
  },
});

flashcardReviewLogSchema.index({ userId: 1, reviewedAt: -1 });
flashcardReviewLogSchema.index({ flashcardSetId: 1, cardId: 1 });

const FlashcardReviewLog = model<FlashcardReviewLogDocument>("FlashcardReviewLog", flashcardReviewLogSchema);
export default FlashcardReviewLog;
