import axiosInstance from "@/utils/axiosInstance";
import { API_PATHS } from "@/utils/apiPath";
import type { FlashcardSetsResponse } from "@/types/api.types";

const getAllFlashcardSets = async (): Promise<FlashcardSetsResponse> => {
  try {
    const response = await axiosInstance.get<FlashcardSetsResponse>(
      API_PATHS.FLASHCARDS.GET_ALL_FLASHCARDS_SET
    );
    return response.data;
  } catch (error) {
    const err = error as { response?: { data?: unknown } };
    throw err.response?.data || "Lấy danh sách flashcard thất bại";
  }
};

const getAllFlashcardsForDocument = async (
  documentId: string
): Promise<FlashcardSetsResponse> => {
  try {
    const response = await axiosInstance.get<FlashcardSetsResponse>(
      API_PATHS.FLASHCARDS.GET_FLASHCARDS_FOR_DOCUMENT(documentId)
    );
    return response.data;
  } catch (error) {
    const err = error as { response?: { data?: unknown } };
    throw err.response?.data || "Lấy danh sách flashcard thất bại";
  }
};

const reviewFlashcard = async (
  cardId: string
): Promise<FlashcardSetsResponse> => {
  try {
    const response = await axiosInstance.post<FlashcardSetsResponse>(
      API_PATHS.FLASHCARDS.REVIEW_FLASHCARD(cardId)
    );
    return response.data;
  } catch (error) {
    const err = error as { response?: { data?: unknown } };
    throw err.response?.data || "Đánh giá flashcard thất bại";
  }
};

const toggleStarFlashcard = async (
  cardId: string
): Promise<FlashcardSetsResponse> => {
  try {
    const response = await axiosInstance.put<FlashcardSetsResponse>(
      API_PATHS.FLASHCARDS.TOGGLE_STAR_FLASHCARD(cardId)
    );
    return response.data;
  } catch (error) {
    const err = error as { response?: { data?: unknown } };
    throw err.response?.data || "Cập nhật thất bại star của flashcard";
  }
};

const deleteFlashcardSet = async (
  flashcardId: string
): Promise<FlashcardSetsResponse> => {
  try {
    const response = await axiosInstance.delete<FlashcardSetsResponse>(
      API_PATHS.FLASHCARDS.DELETE_FLASHCARD_SET(flashcardId)
    );
    return response.data;
  } catch (error) {
    const err = error as { response?: { data?: unknown } };
    throw err.response?.data || "Xóa bộ flashcard thất bại";
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
