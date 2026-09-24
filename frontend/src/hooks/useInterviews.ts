import { useState, useCallback } from 'react';
import { interviewService } from '@/services/interviewService';
import type { 
  InterviewSessionData, 
  SetupInterviewParams,
  ChatInterviewParams
} from '@/types/interview';
import { toast } from 'sonner';

export const useInterviews = () => {
  const [sessions, setSessions] = useState<InterviewSessionData[]>([]);
  const [currentSession, setCurrentSession] = useState<InterviewSessionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await interviewService.getSessions();
      setSessions(response.sessions);
      setError(null);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Lỗi khi tải danh sách phỏng vấn';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSessionById = useCallback(async (sessionId: string) => {
    setLoading(true);
    try {
      const data = await interviewService.getSessionById(sessionId);
      setCurrentSession(data);
      setError(null);
      return data;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Lỗi khi tải dữ liệu phỏng vấn';
      setError(msg);
      toast.error(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const setupSession = useCallback(async (params: SetupInterviewParams) => {
    setLoading(true);
    try {
      const data = await interviewService.setupSession(params);
      setCurrentSession(data);
      toast.success('Khởi tạo phòng phỏng vấn thành công!');
      return data;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Lỗi khi tạo phòng phỏng vấn';
      setError(msg);
      toast.error(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const chat = useCallback(async (params: ChatInterviewParams) => {
    try {
      const response = await interviewService.chat(params);
      // Update local session state for seamless UX
      setCurrentSession((prev: InterviewSessionData | null) => {
        if (!prev) return prev;
        return {
          ...prev,
          questionsAsked: prev.questionsAsked + 1,
          messages: [
            ...prev.messages,
            { role: 'user', content: params.message, timestamp: new Date().toISOString() },
            { role: 'assistant', content: response.question, timestamp: new Date().toISOString() }
          ]
        };
      });
      return response;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể nhận phản hồi từ AI';
      toast.error(msg);
      return null;
    }
  }, []);

  const finishSession = useCallback(async (sessionId: string) => {
    setLoading(true);
    try {
      const report = await interviewService.finishSession(sessionId);
      setCurrentSession((prev: InterviewSessionData | null) => prev ? { ...prev, status: 'completed', report } as InterviewSessionData : null);
      toast.success('Đã nộp bài phỏng vấn!');
      return report;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Lỗi khi nộp bài';
      setError(msg);
      toast.error(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      await interviewService.deleteSession(sessionId);
      setSessions((prev) => prev.filter((s) => s._id !== sessionId));
      toast.success('Đã xóa phiên phỏng vấn');
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Lỗi khi xóa phiên phỏng vấn';
      toast.error(msg);
      return false;
    }
  }, []);

  return {
    sessions,
    currentSession,
    loading,
    error,
    fetchSessions,
    fetchSessionById,
    setupSession,
    chat,
    finishSession,
    deleteSession,
  };
};
