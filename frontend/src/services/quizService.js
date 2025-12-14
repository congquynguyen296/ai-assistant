import axiosInstance from "@/utils/axiosInstance.js";
import { API_PATHS } from "@/utils/apiPath.js";

const getQuizzesForDocument = async (documentId) => {
  try {
    const response = await axiosInstance.get(
      API_PATHS.QUIZZES.GET_QUIZZES_FOR_DOCUMENT(documentId)
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Lấy quizzes thất bại" };
  }
};

const getQuizzes = async () => {
  try {
    const response = await axiosInstance.get(API_PATHS.QUIZZES.GET_QUIZZES);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Lấy quizzes thất bại" };
  }
};

const getQuizById = async (quizId) => {
  try {
    const response = await axiosInstance.get(
      API_PATHS.QUIZZES.GET_QUIZ_BY_ID(quizId)
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Lấy quiz thất bại" };
  }
};

const submitQuiz = async (quizId, answers) => {
  try {
    const response = await axiosInstance.post(
      API_PATHS.QUIZZES.SUBMIT_QUIZ(quizId),
      { answers }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Nộp quiz thất bại" };
  }
};

const getQuizResults = async (quizId) => {
  try {
    const response = await axiosInstance.get(
      API_PATHS.QUIZZES.GET_QUIZ_RESULTS(quizId)
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Lấy kết quả quiz thất bại" };
  }
};

const deleteQuiz = async (quizId) => {
  try {
    const response = await axiosInstance.delete(
      API_PATHS.QUIZZES.DELETE_QUIZ(quizId)
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Xóa quiz thất bại" };
  }
};

const quizService = {
  getQuizzesForDocument,
  getQuizzes,
  getQuizById,
  submitQuiz,
  getQuizResults,
  deleteQuiz,
};
export default quizService;
