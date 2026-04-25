export const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const API_PATHS = {
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    GOOGLE_LOGIN: "/auth/google-login",
    PROFILE: "auth/profile",
    UPDATE_PROFILE: "auth/profile",
    CHANGE_PASSWORD: "auth/change-password",
    CONFIRM_EMAIL: "/auth/confirm-email",
    RESEND_OTP: "/auth/resend-otp",
  },

  DOCUMENTS: {
    UPLOAD: "/documents/upload",
    GET_DOCUMENTS: "/documents",
    DELETE_DOCUMENT: (id: string) => `/documents/${id}`,
    GET_DOCUMENT_BY_ID: (id: string) => `/documents/${id}`,
    RENAME_DOCUMENT: (id: string) => `/documents/${id}`,
  },

  AI: {
    GENERATE_FLASHCARDS: "/ai-generation/generate-flashcards",
    GENERATE_QUIZ: "/ai-generation/generate-quiz",
    GENERATE_SUMMARY: "/ai-generation/generate-summary",
    EXPLAIN_CONCEPT: "/ai-generation/explain-concept",
    CHAT: "/ai-generation/chat",
    GET_CHAT_HISTORY: (documentId: string) =>
      `/ai-generation/chat-history?documentId=${documentId}`,
    DELETE_CHAT_HISTORY: (documentId: string) =>
      `/ai-generation/chat-history?documentId=${documentId}`,
  },

  FLASHCARDS: {
    GET_ALL_FLASHCARDS_SET: "/flashcards",
    GET_FLASHCARDS_FOR_DOCUMENT: (documentId: string) =>
      `/flashcards/${documentId}`,
    REVIEW_FLASHCARD: (cardId: string) => `/flashcards/${cardId}/review`,
    TOGGLE_STAR_FLASHCARD: (cardId: string) => `/flashcards/${cardId}/star`,
    DELETE_FLASHCARD_SET: (flashcardId: string) => `/flashcards/${flashcardId}`,
  },

  QUIZZES: {
    GET_ALL_QUIZZES: (page: number, size: number) =>
      `/quizzes?page=${page}&size=${size}`,
    GET_QUIZZES_FOR_DOCUMENT: (documentId: string) => `/quizzes/${documentId}`,
    GET_QUIZ_BY_ID: (quizId: string) => `/quizzes/quiz/${quizId}`,
    SUBMIT_QUIZ: (quizId: string) => `/quizzes/${quizId}/submit`,
    GET_QUIZ_RESULTS: (quizId: string) => `/quizzes/${quizId}/results`,
    DELETE_QUIZ: (quizId: string) => `/quizzes/${quizId}`,
  },

  PROGRESS: {
    GET_DASHBOARD: "/progress/dashboard",
  },
};
