import { Schema, model } from "mongoose";
import type { ChatHistoryDocument } from "@/types/entity.js";

const chatHistorySchema = new Schema<ChatHistoryDocument>(
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
    messages: [
      {
        role: {
          type: String,
          enum: ["user", "assistant"],
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
          required: true,
        },
        relevantChunks: {
          type: [Number],
          default: [],
        },
      },
    ],
  },
  { timestamps: true },
);

chatHistorySchema.index({ userId: 1, documentId: 1 });

const ChatHistory = model<ChatHistoryDocument>("ChatHistory", chatHistorySchema);
export default ChatHistory;
