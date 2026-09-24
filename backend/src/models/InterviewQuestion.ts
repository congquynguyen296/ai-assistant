import mongoose, { Schema } from 'mongoose';
import type { InterviewQuestionDocument } from '@/types/entity.js';
import { Difficulty, InterviewQuestionSource } from '@/types/enums.js';

const interviewQuestionSchema = new Schema<InterviewQuestionDocument>(
  {
    topicId: { type: Schema.Types.ObjectId, ref: 'InterviewTopic', required: true },
    question: { type: String, required: true },
    difficulty: {
      type: String,
      enum: Object.values(Difficulty),
      required: true,
    },
    source: {
      type: String,
      enum: Object.values(InterviewQuestionSource),
      default: InterviewQuestionSource.AI_GENERATED,
    },
    expectedAnswerContext: { type: String },
  },
  { timestamps: true }
);

interviewQuestionSchema.index({ topicId: 1, difficulty: 1 });

const InterviewQuestion = mongoose.model<InterviewQuestionDocument>('InterviewQuestion', interviewQuestionSchema);
export default InterviewQuestion;
