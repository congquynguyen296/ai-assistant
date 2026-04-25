import axiosInstance from "@/utils/axiosInstance";
import { API_PATHS } from "@/utils/apiPath";
import type {
  ChatHistoryResponse,
  ChatResponse,
  ExplainConceptResponse,
  SummaryResponse,
} from "@/types/api.types";
import type { ApiResponse } from "@/types/common.types";

const generateFlashcards = async (
  documentId: string,
  options: Record<string, unknown> = {}
): Promise<ApiResponse<unknown>> => {
  try {
    const response = await axiosInstance.post<ApiResponse<unknown>>(
      API_PATHS.AI.GENERATE_FLASHCARDS,
      {
        documentId,
        ...options,
      }
    );
    return response.data;
  } catch (error) {
    const err = error as { response?: { data?: unknown } };
    throw err.response?.data || "Tạo flashcard thất bại";
  }
};

const generateQuiz = async (
  documentId: string,
  options: Record<string, unknown> = {}
): Promise<ApiResponse<unknown>> => {
  try {
    const response = await axiosInstance.post<ApiResponse<unknown>>(
      API_PATHS.AI.GENERATE_QUIZ,
      {
        documentId,
        ...options,
      }
    );
    return response.data;
  } catch (error) {
    const err = error as { response?: { data?: unknown } };
    throw err.response?.data || "Tạo quiz thất bại";
  }
};

const generateSummary = async (
  documentId: string,
  options: Record<string, unknown> = {}
): Promise<SummaryResponse> => {
  try {
    const response = await axiosInstance.post<SummaryResponse>(
      API_PATHS.AI.GENERATE_SUMMARY,
      {
        documentId,
        ...options,
      }
    );
    return response.data;
  } catch (error) {
    const err = error as { response?: { data?: unknown } };
    throw err.response?.data || "Tạo summary thất bại";
  }
};

const chat = async (
  documentId: string,
  message: string
): Promise<ChatResponse> => {
  try {
    const response = await axiosInstance.post<ChatResponse>(API_PATHS.AI.CHAT, {
      documentId,
      question: message,
    }); // Removed history from payload
    return response.data;
  } catch (error) {
    const err = error as { response?: { data?: unknown } };
    throw err.response?.data || { message: "Chat request failed" };
  }
};

const explainConcept = async (
  documentId: string,
  concept: string
): Promise<ExplainConceptResponse> => {
  try {
    const response = await axiosInstance.post<ExplainConceptResponse>(
      API_PATHS.AI.EXPLAIN_CONCEPT,
      {
        documentId,
        concept,
      }
    );
    return response.data;
  } catch (error) {
    const err = error as { response?: { data?: unknown } };
    throw err.response?.data || { message: "Failed to explain concept" };
  }
};

const getChatHistory = async (
  documentId: string
): Promise<ChatHistoryResponse> => {
  try {
    const response = await axiosInstance.get<ChatHistoryResponse>(
      API_PATHS.AI.GET_CHAT_HISTORY(documentId)
    );
    return response.data;
  } catch (error) {
    const err = error as { response?: { data?: unknown } };
    throw err.response?.data || { message: "Failed to fetch chat history" };
  }
};

const deleteChatHistory = async (
  documentId: string
): Promise<ChatHistoryResponse> => {
  try {
    const response = await axiosInstance.delete<ChatHistoryResponse>(
      API_PATHS.AI.DELETE_CHAT_HISTORY(documentId)
    );
    return response?.data;
  } catch (error) {
    const err = error as { response?: { data?: unknown } };
    throw err.response?.data || { message: "Failed to delete chat history" };
  }
};

const aiService = {
  generateFlashcards,
  generateQuiz,
  generateSummary,
  chat,
  explainConcept,
  getChatHistory,
  deleteChatHistory,
};

export default aiService;
