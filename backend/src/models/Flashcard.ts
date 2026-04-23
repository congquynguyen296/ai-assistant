import { Schema, model } from "mongoose";
import type { FlashcardDocument } from "@/types/entity.js";

const flashcardSchema = new Schema<FlashcardDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    documentId: {
      type: Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Tiêu đề flashcard không được để trống"],
      trim: true,
    },
    cards: [
      {
        question: {
          type: String,
          required: true,
        },
        answer: {
          type: String,
          required: true,
        },
        difficulty: {
          type: String,
          enum: ["easy", "medium", "hard"],
          default: "medium",
        },
        lastReviewed: {
          type: Date,
          default: null,
        },
        reviewCount: {
          type: Number,
          default: 0,
        },
        isStarred: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  { timestamps: true },
);

flashcardSchema.index({ userId: 1, documentId: 1 });

const Flashcard = model<FlashcardDocument>("Flashcard", flashcardSchema);
export default Flashcard;
