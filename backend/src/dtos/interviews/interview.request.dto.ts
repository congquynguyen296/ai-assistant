import { z } from 'zod';

import { InterviewMode } from '@/types/enums.js';

export const InterviewModeSchema = z.nativeEnum(InterviewMode);

export const SetupInterviewRequestSchema = z.object({
  mode: InterviewModeSchema,
  documentIds: z.array(z.string()).optional(), // Provided if using existing files
  topicName: z.string().optional(), // Provided if mode is 'knowledge'
  customText: z.string().optional(), // Provided if user pasted raw text
  level: z.string().optional(), // Provided to adjust the difficulty of the interview
});
export type SetupInterviewRequestDto = z.infer<typeof SetupInterviewRequestSchema>;

export const ChatInterviewRequestSchema = z.object({
  message: z.string().min(1),
});
export type ChatInterviewRequestDto = z.infer<typeof ChatInterviewRequestSchema>;
