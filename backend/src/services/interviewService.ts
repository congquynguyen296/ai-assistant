import mongoose from 'mongoose';
import InterviewSession from '@/models/InterviewSession.js';
import type { InterviewMessage } from '@/types/entity.js';
import { InterviewMode, InterviewStatus, Difficulty, InterviewQuestionSource } from '@/types/enums.js';
import InterviewTopic from '@/models/InterviewTopic.js';
import InterviewQuestion from '@/models/InterviewQuestion.js';
import Document from '@/models/Document.js';
import { AppError } from '@/middlewares/errorHandle.js';
import {
  generateInterviewBlueprint,
  generateNextQuestion,
  generateInterviewReport,
} from './interviewAiService.js';
import { computeInterviewState } from '@/utils/interviewPrompts.js';

export const createInterviewSessionService = async (input: {
  userId: string;
  mode: InterviewMode;
  documentIds?: string[];
  topicName?: string;
  customText?: string;
  level?: string;
}) => {
  const { userId, mode, documentIds, topicName, customText, level } = input;
  
  let cvText: string | null = null;
  let jdText: string | null = null;
  let topicId: mongoose.Types.ObjectId | undefined;

  // Process Documents if provided
  if (documentIds && documentIds.length > 0) {
    for (const docId of documentIds) {
      const doc = await Document.findOne({ _id: docId, userId });
      if (!doc) throw new AppError('Tài liệu không tồn tại hoặc không thuộc quyền sở hữu', 404);
      if (doc.status !== 'ready') throw new AppError('Tài liệu đang xử lý, vui lòng chờ', 400);

      // Simple heuristic: first doc is CV, second is JD (can be refined based on UI selection)
      if (!cvText) {
        cvText = doc.extractedText;
      } else if (!jdText) {
        jdText = doc.extractedText;
      }
    }
  }

  // Process Topic
  if (mode === 'knowledge' && topicName) {
    const topicNameLower = topicName.trim().toLowerCase();
    let topic = await InterviewTopic.findOne({ name: topicNameLower });
    if (!topic) {
      topic = await InterviewTopic.create({ name: topicNameLower });
    }
    await InterviewTopic.findByIdAndUpdate(topic._id, { $inc: { usageCount: 1 } });
    topicId = topic._id;
  }

  // Generate Blueprint via AI
  const blueprint = await generateInterviewBlueprint(
    mode,
    cvText,
    jdText,
    topicName || null,
    customText || null,
    level || 'Middle'
  );

  // Create Session
  const session = await InterviewSession.create({
    userId,
    mode,
    level: level || 'Middle',
    documentIds: documentIds || [],
    topicId,
    blueprint,
    messages: [
      {
        role: 'assistant',
        content: blueprint.initialQuestion || 'Xin chào, chúng ta bắt đầu buổi phỏng vấn nhé!',
        timestamp: new Date(),
      }
    ],
    maxQuestions: blueprint.recommendedMaxQuestions || 10,
    questionsAsked: 1,
    status: InterviewStatus.IN_PROGRESS,
  });

  return session;
};

export const chatInterviewService = async (input: {
  userId: string;
  sessionId: string;
  message: string;
}) => {
  const { userId, sessionId, message } = input;

  const session = await InterviewSession.findOne({ _id: sessionId, userId });
  if (!session) throw new AppError('Phiên phỏng vấn không tồn tại', 404);
  if (session.status !== InterviewStatus.IN_PROGRESS) throw new AppError('Phiên phỏng vấn đã kết thúc', 400);

  // Define User Message
  const userMsg: InterviewMessage = {
    role: 'user',
    content: message,
    timestamp: new Date(),
  };

  const answeredCount = session.messages.filter(m => m.role === 'user').length + 1;
  const maxQuestions = session.maxQuestions || 10;
  const focusAreas = (session.blueprint as any)?.focusAreas || [];
  
  const state = computeInterviewState(answeredCount, maxQuestions, focusAreas);

  if (state.isFinished) {
    session.status = InterviewStatus.COMPLETED;
    session.messages.push(userMsg as any);
    await session.save();
    return { question: 'Phiên phỏng vấn đã hoàn thành. Đang tạo báo cáo...', isFinished: true };
  }

  // Get recent context (oldest -> newest, max 6 messages for context)
  const recentMessages = session.messages.slice(-5).map(m => ({ role: m.role, content: m.content }));
  recentMessages.push({ role: 'user', content: message }); // Include the current user message

  // Generate AI Response
  const aiResponse = await generateNextQuestion(session.blueprint as any, session.level || 'Middle', recentMessages, state, maxQuestions);
  
  // Define AI Message
  const aiMsg: InterviewMessage = {
    role: 'assistant',
    content: aiResponse.question,
    timestamp: new Date(),
  };

  // Atomic Update: Save both user and AI message together + Increment questionsAsked
  await InterviewSession.updateOne(
    { _id: session._id },
    { 
      $push: { messages: { $each: [userMsg, aiMsg] } },
      $inc: { questionsAsked: 1 }
    }
  );

  // Save generated question to Question Bank if Knowledge mode
  if (session.topicId) {
    await InterviewQuestion.create({
      topicId: session.topicId,
      question: aiResponse.question,
      difficulty: Difficulty.MEDIUM,
      source: InterviewQuestionSource.AI_GENERATED,
      expectedAnswerContext: aiResponse.feedbackToPreviousAnswer || 'No context',
    });
  }

  return {
    question: aiResponse.question,
    isFinished: false,
  };
};

export const finishInterviewService = async (input: { userId: string; sessionId: string }) => {
  const { userId, sessionId } = input;

  const session = await InterviewSession.findOne({ _id: sessionId, userId });
  if (!session) throw new AppError('Phiên phỏng vấn không tồn tại', 404);
  if (session.status === InterviewStatus.COMPLETED && session.report) return session.report;

  const allMessages = session.messages.map(m => ({ role: m.role, content: m.content }));
  
  const report = await generateInterviewReport(session.blueprint as any, session.level || 'Middle', allMessages);

  session.status = InterviewStatus.COMPLETED;
  session.report = report as Record<string, unknown>;
  await session.save();

  return report;
};

export const getInterviewSessionService = async (input: { userId: string; sessionId: string }) => {
  const { userId, sessionId } = input;
  const session = await InterviewSession.findOne({ _id: sessionId, userId }).populate('topicId', 'name');
  if (!session) throw new AppError('Phiên phỏng vấn không tồn tại', 404);
  return session;
};

export const getTrendingTopicsService = async () => {
  const topics = await InterviewTopic.find().sort({ usageCount: -1 }).limit(5);
  return topics;
};

export const searchTopicsService = async (query: string) => {
  if (!query) return [];
  const topics = await InterviewTopic.find({ name: { $regex: query, $options: 'i' } })
    .sort({ usageCount: -1 })
    .limit(10);
  return topics;
};

export const getInterviewSessionsListService = async (userId: string, page: number = 1, size: number = 10) => {
  // Cleanup abandoned sessions implicitly
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  await InterviewSession.updateMany(
    { userId, status: InterviewStatus.IN_PROGRESS, updatedAt: { $lt: twentyFourHoursAgo } },
    { $set: { status: InterviewStatus.ABANDONED } }
  );

  const total = await InterviewSession.countDocuments({ userId });
  const sessions = await InterviewSession.find({ userId })
    .sort({ updatedAt: -1 })
    .skip((page - 1) * size)
    .limit(size)
    .populate('topicId', 'name');
    
  return {
    sessions,
    pagination: {
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    }
  };
};

export const deleteInterviewSessionService = async (input: { userId: string; sessionId: string }) => {
  const { userId, sessionId } = input;
  const session = await InterviewSession.findOne({ _id: sessionId, userId });
  if (!session) throw new AppError('Phiên phỏng vấn không tồn tại', 404);
  
  if (session.status === InterviewStatus.COMPLETED) {
    throw new AppError('Không thể xóa phiên phỏng vấn đã hoàn thành', 400);
  }

  await InterviewSession.deleteOne({ _id: sessionId });
};
