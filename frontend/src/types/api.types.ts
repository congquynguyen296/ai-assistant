import type { ApiResponse } from "@/types/common.types";
import type {
  ChatMessage,
  DashboardData,
  Document,
  FlashcardSet,
  Quiz,
  QuizResultsPayload,
  User,
} from "@/types/models";
import type { AuthSession } from "@/types/auth.types";

export interface AuthLoginRequest {
  email: string;
  password: string;
}

export interface AuthRegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthVerifyOtpRequest {
  email: string;
  otp: string;
}

export interface AuthResendOtpRequest {
  email: string;
}

export interface AuthChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export type AuthResponse = ApiResponse<AuthSession>;
export type ProfileResponse = ApiResponse<User>;

export interface DocumentListPayload {
  documents: Document[];
}

export type DocumentListResponse = ApiResponse<DocumentListPayload>;
export type DocumentDetailResponse = ApiResponse<Document>;

export type FlashcardSetsResponse = ApiResponse<FlashcardSet[]>;

export interface QuizListPayload {
  quizzes: Quiz[];
  pagination?: {
    totalPages?: number;
    page?: number;
    size?: number;
  };
}

export type QuizListResponse = ApiResponse<QuizListPayload>;
export type QuizDetailResponse = ApiResponse<Quiz>;
export type QuizResultsResponse = ApiResponse<QuizResultsPayload>;

export interface ChatResponsePayload {
  answer: string;
  relevantChunks?: unknown[];
}

export type ChatResponse = ApiResponse<ChatResponsePayload>;
export type ChatHistoryPayload = ChatMessage[] | { messages: ChatMessage[] };
export type ChatHistoryResponse = ApiResponse<ChatHistoryPayload>;

export type SummaryResponse = ApiResponse<string>;
export type ExplainConceptResponse = ApiResponse<{ explanation?: string }>;

export type DashboardResponse = ApiResponse<DashboardData>;
