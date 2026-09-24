import OpenAI from 'openai';
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';
import { AppError } from '@/middlewares/errorHandle.js';

if (
  !process.env.AZURE_OPENAI_API_KEY ||
  !process.env.AZURE_OPENAI_ENDPOINT ||
  !process.env.AZURE_OPENAI_DEPLOYMENT_NAME
) {
  console.error('Lỗi biến môi trường: Thiếu cấu hình AZURE_OPENAI_*');
  process.exit(1);
}

const ai = new OpenAI({
  baseURL: process.env.AZURE_OPENAI_ENDPOINT,
  apiKey: process.env.AZURE_OPENAI_API_KEY,
});

const modelName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;

import {
  BlueprintResponseSchema,
  InterviewBlueprint,
  NextQuestionSchema,
  NextQuestion,
  ReportSchema,
  InterviewReport,
  getBlueprintPrompt,
  getNextQuestionPrompt,
  getReportPrompt,
  computeInterviewState,
} from '@/utils/interviewPrompts.js';

// --- HELPER: AI CALL WITH RETRY ---
async function callAiWithRetry<T>(
  prompt: string,
  schema: z.ZodType<T>,
  schemaName: string,
  temperature: number = 0.5,
  retries = 2
): Promise<T> {
  let lastError: any = null;
  
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await ai.chat.completions.create({
        model: modelName,
        messages: [{ role: 'user', content: prompt }],
        response_format: zodResponseFormat(schema, schemaName),
      });

      const parsed = JSON.parse(response.choices[0].message.content || '{}');
      return schema.parse(parsed); // Strict Zod Validation
    } catch (error) {
      console.warn(`[AI Retry ${i}] Failed to parse/validate output for ${schemaName}. Retrying...`);
      lastError = error;
    }
  }
  
  console.error(`[AI Error] All retries failed for ${schemaName}:`, lastError);
  throw new AppError('AI trả về dữ liệu không hợp lệ. Vui lòng thử lại.', 500);
}

// --- SERVICES ---

export const generateInterviewBlueprint = async (
  mode: string,
  cvText: string | null,
  jdText: string | null,
  topicName: string | null,
  customText: string | null,
  level: string
): Promise<InterviewBlueprint> => {
  const prompt = getBlueprintPrompt(mode, cvText, jdText, topicName, customText, level);

  try {
    const blueprint = await callAiWithRetry(prompt, BlueprintResponseSchema, 'blueprint', 0.5);
    
    // Validate blueprint (clamp max questions and areas based on guide if needed)
    // Actually done strictly in getNextQuestionPrompt logic using computeInterviewState
    
    return blueprint;
  } catch (error) {
    throw new AppError('Lỗi khi sinh cấu trúc phỏng vấn', 500);
  }
};

export const generateNextQuestion = async (
  blueprint: InterviewBlueprint,
  level: string,
  recentMessages: Array<{ role: string; content: string }>,
  state: ReturnType<typeof computeInterviewState>,
  maxQuestions: number
): Promise<NextQuestion> => {
  // Truncate answers if too long (~1500 chars)
  const chatHistoryContext = recentMessages
    .map((msg) => {
      let content = msg.content;
      if (msg.role === 'user' && content.length > 1500) {
        content = content.substring(0, 1500) + '...';
      }
      return `${msg.role.toUpperCase()}: ${content}`;
    })
    .join('\n\n');

  const prompt = getNextQuestionPrompt(blueprint, level, chatHistoryContext, state, maxQuestions);

  try {
    return await callAiWithRetry(prompt, NextQuestionSchema, 'next_question', 0.4);
  } catch (error) {
    throw new AppError('Lỗi khi sinh câu hỏi tiếp theo', 500);
  }
};

export const generateInterviewReport = async (
  blueprint: InterviewBlueprint,
  level: string,
  allMessages: Array<{ role: string; content: string }>
): Promise<InterviewReport> => {
  const fullConversation = allMessages
    .map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
    .join('\n\n');

  const prompt = getReportPrompt(blueprint, level, fullConversation);

  try {
    return await callAiWithRetry(prompt, ReportSchema, 'report', 0.5);
  } catch (error) {
    throw new AppError('Lỗi khi đánh giá kết quả phỏng vấn', 500);
  }
};
