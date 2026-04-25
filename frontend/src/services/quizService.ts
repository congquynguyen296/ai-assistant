import axiosInstance from "@/utils/axiosInstance";
import { API_PATHS } from "@/utils/apiPath";
import type {
  QuizDetailResponse,
  QuizListResponse,
  QuizResultsResponse,
} from "@/types/api.types";

const getQuizzesForDocument = async (
  documentId: string
): Promise<QuizListResponse> => {
  try {
    const response = await axiosInstance.get<QuizListResponse>(
      API_PATHS.QUIZZES.GET_QUIZZES_FOR_DOCUMENT(documentId)
    );
    return response.data;
  } catch (error) {
    const err = error as { response?: { data?: unknown } };
    throw err.response?.data || { message: "Lấy quizzes thất bại" };
  }
};

const getQuizzes = async (
  page = 1,
  size = 9
): Promise<QuizListResponse> => {
  try {
    const response = await axiosInstance.get<QuizListResponse>(
      API_PATHS.QUIZZES.GET_ALL_QUIZZES(page, size)
    );
    return response.data;
  } catch (error) {
    const err = error as { response?: { data?: unknown } };
    throw err.response?.data || { message: "Lấy quizzes thất bại" };
  }
};

const getQuizById = async (
  quizId: string
): Promise<QuizDetailResponse> => {
  try {
    const response = await axiosInstance.get<QuizDetailResponse>(
      API_PATHS.QUIZZES.GET_QUIZ_BY_ID(quizId)
    );
    return response.data;
  } catch (error) {
    const err = error as { response?: { data?: unknown } };
    throw err.response?.data || { message: "Lấy quiz thất bại" };
  }
};

const submitQuiz = async (
  quizId: string,
  answers: Array<{ questionIndex: number; selectedAnswer: string }>
): Promise<QuizResultsResponse> => {
  try {
    const response = await axiosInstance.post<QuizResultsResponse>(
      API_PATHS.QUIZZES.SUBMIT_QUIZ(quizId),
      { answers }
    );
    return response.data;
  } catch (error) {
    const err = error as { response?: { data?: unknown } };
    throw err.response?.data || { message: "Nộp quiz thất bại" };
  }
};

const getQuizResults = async (
  quizId: string
): Promise<QuizResultsResponse> => {
  try {
    const response = await axiosInstance.get<QuizResultsResponse>(
      API_PATHS.QUIZZES.GET_QUIZ_RESULTS(quizId)
    );
    return response.data;
  } catch (error) {
    const err = error as { response?: { data?: unknown } };
    throw err.response?.data || { message: "Lấy kết quả quiz thất bại" };
  }
};

const deleteQuiz = async (
  quizId: string
): Promise<QuizResultsResponse> => {
  try {
    const response = await axiosInstance.delete<QuizResultsResponse>(
      API_PATHS.QUIZZES.DELETE_QUIZ(quizId)
    );
    return response.data;
  } catch (error) {
    const err = error as { response?: { data?: unknown } };
    throw err.response?.data || { message: "Xóa quiz thất bại" };
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
