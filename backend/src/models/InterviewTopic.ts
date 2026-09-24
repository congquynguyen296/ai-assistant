import mongoose, { Schema } from 'mongoose';
import type { InterviewTopicDocument } from '@/types/entity.js';

const interviewTopicSchema = new Schema<InterviewTopicDocument>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    usageCount: { type: Number, default: 0 },
    category: { type: String, trim: true },
  },
  { timestamps: true }
);

interviewTopicSchema.index({ usageCount: -1 });

const InterviewTopic = mongoose.model<InterviewTopicDocument>('InterviewTopic', interviewTopicSchema);
export default InterviewTopic;
