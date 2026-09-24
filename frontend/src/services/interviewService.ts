import axiosInstance from '@/utils/axiosInstance';
import { API_PATHS } from '@/utils/apiPath';
import type { 
  SetupInterviewParams, 
  ChatInterviewParams, 
  InterviewSessionData 
} from '@/types/interview';

export const interviewService = {
  getSessions: async (page = 1, size = 10): Promise<{ sessions: InterviewSessionData[]; pagination: any }> => {
    const response = await axiosInstance.get(API_PATHS.INTERVIEWS.GET_SESSIONS, {
      params: { page, size }
    });
    return response.data;
  },

  getSessionById: async (sessionId: string): Promise<InterviewSessionData> => {
    const response = await axiosInstance.get(API_PATHS.INTERVIEWS.GET_SESSION_BY_ID(sessionId));
    return response.data;
  },

  setupSession: async (params: SetupInterviewParams): Promise<InterviewSessionData> => {
    const response = await axiosInstance.post(API_PATHS.INTERVIEWS.SETUP, params);
    return response.data;
  },

  chat: async (params: ChatInterviewParams): Promise<{ question: string; isFinished: boolean }> => {
    const response = await axiosInstance.post(API_PATHS.INTERVIEWS.CHAT(params.sessionId), {
      message: params.message,
    });
    return response.data;
  },

  finishSession: async (sessionId: string): Promise<Record<string, any>> => {
    const response = await axiosInstance.post(API_PATHS.INTERVIEWS.FINISH(sessionId));
    return response.data;
  },

  getTrendingTopics: async (): Promise<Array<{ _id: string; name: string; usageCount: number }>> => {
    const response = await axiosInstance.get(API_PATHS.INTERVIEWS.GET_TRENDING_TOPICS);
    return response.data;
  },

  searchTopics: async (query: string): Promise<Array<{ _id: string; name: string; usageCount: number }>> => {
    const response = await axiosInstance.get(API_PATHS.INTERVIEWS.SEARCH_TOPICS(query));
    return response.data;
  },

  deleteSession: async (sessionId: string): Promise<void> => {
    await axiosInstance.delete(API_PATHS.INTERVIEWS.DELETE_INTERVIEW(sessionId));
  },
};
