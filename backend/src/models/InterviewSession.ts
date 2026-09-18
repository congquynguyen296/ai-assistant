import mongoose, { Schema } from 'mongoose';
import type { InterviewSessionDocument } from '@/types/entity.js';
import { InterviewMode, InterviewStatus } from '@/types/enums.js';

const interviewSessionSchema = new Schema<InterviewSessionDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    mode: {
      type: String,
      enum: Object.values(InterviewMode),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(InterviewStatus),
      default: InterviewStatus.SETUP,
    },
    documentIds: [{ type: Schema.Types.ObjectId, ref: 'Document' }],
    topicId: { type: Schema.Types.ObjectId, ref: 'InterviewTopic' },
    blueprint: { type: Schema.Types.Mixed },
    messages: [
      {
        role: { type: String, enum: ['user', 'assistant'], required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    report: { type: Schema.Types.Mixed },
    maxQuestions: { type: Number, default: 10 },
    questionsAsked: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Indexes for faster querying
interviewSessionSchema.index({ userId: 1, status: 1 });
interviewSessionSchema.index({ status: 1, updatedAt: 1 }); // For abandoned cleanup

const InterviewSession = mongoose.model<InterviewSessionDocument>('InterviewSession', interviewSessionSchema);
export default InterviewSession;
