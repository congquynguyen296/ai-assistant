import { Request, Response } from 'express';
import {
  createInterviewSessionService,
  chatInterviewService,
  finishInterviewService,
  getInterviewSessionService,
  getTrendingTopicsService,
  getInterviewSessionsListService,
  deleteInterviewSessionService,
} from '@/services/interviewService.js';
import { SetupInterviewRequestSchema, ChatInterviewRequestSchema } from '@/dtos/interviews/interview.request.dto.js';
import { AppError } from '@/middlewares/errorHandle.js';

export const setupInterview = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError('Không có quyền truy cập', 401);

  const validatedData = SetupInterviewRequestSchema.parse(req.body);

  const session = await createInterviewSessionService({
    userId,
    mode: validatedData.mode,
    documentIds: validatedData.documentIds,
    topicName: validatedData.topicName,
    customText: validatedData.customText,
  });

  res.status(201).json(session);
};

export const chatInterview = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError('Không có quyền truy cập', 401);
  
  const { id: sessionId } = req.params;
  const validatedData = ChatInterviewRequestSchema.parse(req.body);

  const response = await chatInterviewService({
    userId,
    sessionId,
    message: validatedData.message,
  });

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

export const getInterviewSessions = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError('Không có quyền truy cập', 401);

  const sessions = await getInterviewSessionsListService(userId);
  res.status(200).json(sessions);
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
