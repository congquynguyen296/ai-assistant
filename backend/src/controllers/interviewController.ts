import { Request, Response } from 'express';
import {
  createInterviewSessionService,
  chatInterviewService,
  finishInterviewService,
  getInterviewSessionService,
  getTrendingTopicsService,
  searchTopicsService,
  getInterviewSessionsListService,
  deleteInterviewSessionService,
} from '@/services/interviewService.js';
import { SetupInterviewRequestSchema, ChatInterviewRequestSchema } from '@/dtos/interviews/interview.request.dto.js';
import { AppError } from '@/middlewares/errorHandle.js';
import { apiLogger } from '@/utils/logger.js';

export const setupInterview = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError('Không có quyền truy cập', 401);

  apiLogger.info(`[Interview Setup] Request received from userId: ${userId}`);

  const validatedData = SetupInterviewRequestSchema.parse(req.body);

  const session = await createInterviewSessionService({
    userId,
    mode: validatedData.mode,
    documentIds: validatedData.documentIds,
    topicName: validatedData.topicName,
    customText: validatedData.customText,
    level: validatedData.level,
  });

  apiLogger.info(`[Interview Setup] Success for userId: ${userId}, SessionId: ${session._id}`);
  res.status(201).json(session);
};

export const chatInterview = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError('Không có quyền truy cập', 401);
  
  const { id: sessionId } = req.params;
  const validatedData = ChatInterviewRequestSchema.parse(req.body);

  apiLogger.info(`[Interview Chat] User: ${userId}, Session: ${sessionId} sent message`);

  const response = await chatInterviewService({
    userId,
    sessionId,
    message: validatedData.message,
  });

  apiLogger.info(`[Interview Chat] AI Response sent for Session: ${sessionId}`);
  res.status(200).json(response);
};

export const finishInterview = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError('Không có quyền truy cập', 401);
  
  const { id: sessionId } = req.params;

  const report = await finishInterviewService({
    userId,
    sessionId,
  });

  res.status(200).json(report);
};

export const getInterview = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError('Không có quyền truy cập', 401);
  
  const { id: sessionId } = req.params;

  const session = await getInterviewSessionService({
    userId,
    sessionId,
  });

  res.status(200).json(session);
};

export const getTrendingTopics = async (req: Request, res: Response) => {
  const topics = await getTrendingTopicsService();
  res.status(200).json(topics);
};

export const searchTopics = async (req: Request, res: Response) => {
  const query = req.query.q as string;
  const topics = await searchTopicsService(query);
  res.status(200).json(topics);
};

export const getInterviewSessions = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError('Không có quyền truy cập', 401);

  const page = Number.parseInt(String(req.query.page ?? 1), 10) || 1;
  const size = Number.parseInt(String(req.query.size ?? 10), 10) || 10;

  const result = await getInterviewSessionsListService(userId, page, size);
  res.status(200).json(result);
};

export const deleteInterviewSession = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError('Không có quyền truy cập', 401);
  
  const { id: sessionId } = req.params;

  await deleteInterviewSessionService({
    userId,
    sessionId,
  });

  res.status(200).json({ message: 'Đã xóa phiên phỏng vấn' });
};
