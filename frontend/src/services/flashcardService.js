import axiosInstance from "@/utils/axiosInstance.js";
import { API_PATHS } from "@/utils/apiPath.js";

const getAllFlashcardSets = async () => {
  try {
    const response = await axiosInstance.get(
      API_PATHS.FLASHCARDS.GET_ALL_FLASHCARDS_SET
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || "Lấy danh sách flashcard thất bại";
  }
};

const getAllFlashcardsForDocument = async (documentId) => {
  try {
    const response = await axiosInstance.get(
      API_PATHS.FLASHCARDS.GET_FLASHCARDS_FOR_DOCUMENT(documentId)
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || "Lấy danh sách flashcard thất bại";
  }
};

const reviewFlashcard = async (cardId) => {
  try {
    const response = await axiosInstance.post(
      API_PATHS.FLASHCARDS.REVIEW_FLASHCARD(cardId)
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || "Đánh giá flashcard thất bại";
  }
};

const toggleStarFlashcard = async (cardId) => {
  try {
    const response = await axiosInstance.put(
      API_PATHS.FLASHCARDS.TOGGLE_STAR_FLASHCARD(cardId)
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || "Cập nhật thất bại star của flashcard";
  }
};

const deleteFlashcardSet = async (flashcardId) => {
  try {
    const response = await axiosInstance.delete(
      API_PATHS.FLASHCARDS.DELETE_FLASHCARD_SET(flashcardId)
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || "Xóa bộ flashcard thất bại";
  }
};

const flashcardService = {
  getAllFlashcardSets,
  getAllFlashcardsForDocument,
  reviewFlashcard,
  toggleStarFlashcard,
  deleteFlashcardSet,
};
export default flashcardService;
