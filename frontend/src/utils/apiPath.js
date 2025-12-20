// export const BASE_URL = "http://localhost:8000/api/v1";
export const BASE_URL = "https://ai-assistant-cn4r.onrender.com/api/v1";

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
    DELETE_DOCUMENT: (id) => `/documents/${id}`,
    GET_DOCUMENT_BY_ID: (id) => `/documents/${id}`,
  },

  AI: {
    GENERATE_FLASHCARDS: "/ai-generation/generate-flashcards",
    GENERATE_QUIZ: "/ai-generation/generate-quiz",
    GENERATE_SUMMARY: "/ai-generation/generate-summary",
    EXPLAIN_CONCEPT: "/ai-generation/explain-concept",
    CHAT: "/ai-generation/chat",
    GET_CHAT_HISTORY: (documentId) => `/ai-generation/chat-history?documentId=${documentId}`,
    DELETE_CHAT_HISTORY: (documentId) => `/ai-generation/chat-history?documentId=${documentId}`,
  },

  FLASHCARDS: {
    GET_ALL_FLASHCARDS_SET: "/flashcards",
    GET_FLASHCARDS_FOR_DOCUMENT: (documentId) => `/flashcards/${documentId}`,
    REVIEW_FLASHCARD: (cardId) => `/flashcards/${cardId}/review`,
    TOGGLE_STAR_FLASHCARD: (cardId) => `/flashcards/${cardId}/star`,
    DELETE_FLASHCARD_SET: (flashcardId) => `/flashcards/${flashcardId}`,
  },

  QUIZZES: {
    GET_ALL_QUIZZES: "/quizzes",
    GET_QUIZZES_FOR_DOCUMENT: (documentId) => `/quizzes/${documentId}`,
    GET_QUIZ_BY_ID: (quizId) => `/quizzes/quiz/${quizId}`,
    SUBMIT_QUIZ: (quizId) => `/quizzes/${quizId}/submit`,
    GET_QUIZ_RESULTS: (quizId) => `/quizzes/${quizId}/results`,
    DELETE_QUIZ: (quizId) => `/quizzes/${quizId}`,
  },

  PROGRESS: {
    GET_DASHBOARD: "/progress/dashboard",
  },
};
