import axiosInstance from "@/utils/axiosInstance.js";
import { API_PATHS } from "@/utils/apiPath.js";

const generateFlashcards = async (documentId, options = {}) => {
  try {
    const response = await axiosInstance.post(
      API_PATHS.AI.GENERATE_FLASHCARDS,
      {
        documentId,
        ...options,
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || "Tạo flashcard thất bại";
  }
};

const generateQuiz = async (documentId, options = {}) => {
  try {
    const response = await axiosInstance.post(API_PATHS.AI.GENERATE_QUIZ, {
      documentId,
      ...options,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || "Tạo quiz thất bại";
  }
};

const generateSummary = async (documentId, options = {}) => {
  try {
    const response = await axiosInstance.post(API_PATHS.AI.GENERATE_SUMMARY, {
      documentId,
      ...options,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || "Tạo summary thất bại";
  }
};

const chat = async (documentId, message) => {
  try {
    const response = await axiosInstance.post(API_PATHS.AI.CHAT, {
      documentId,
      question: message,
    }); // Removed history from payload
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Chat request failed" };
  }
};

const explainConcept = async (documentId, concept) => {
  try {
    const response = await axiosInstance.post(API_PATHS.AI.EXPLAIN_CONCEPT, {
      documentId,
      concept,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to explain concept" };
  }
};

const getChatHistory = async (documentId) => {
  try {
    const response = await axiosInstance.get(
      API_PATHS.AI.GET_CHAT_HISTORY(documentId)
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch chat history" };
  }
};

const aiService = {
  generateFlashcards,
  generateQuiz,
  generateSummary,
  chat,
  explainConcept,
  getChatHistory,
};

export default aiService;
