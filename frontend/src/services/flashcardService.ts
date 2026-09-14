import axiosInstance from "@/utils/axiosInstance";
import { API_PATHS } from "@/utils/apiPath";
import type { FlashcardSetsResponse } from "@/types/api.types";
import type { Difficulty } from "@/types/enums";

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

const renameFlashcardSet = async (
  setId: string,
  title: string
) => {
  try {
    const response = await axiosInstance.put(
      API_PATHS.FLASHCARDS.RENAME_FLASHCARD_SET(setId),
      { title }
    );
    return response.data;
  } catch (error) {
    const err = error as { response?: { data?: unknown } };
    throw err.response?.data || "Đổi tên bộ flashcard thất bại";
  }
};

const addFlashcardToSet = async (
  setId: string,
  cardData: { question: string; answer: string; difficulty: Difficulty }
) => {
  try {
    const response = await axiosInstance.post(
      API_PATHS.FLASHCARDS.ADD_FLASHCARD_TO_SET(setId),
      cardData
    );
    return response.data;
  } catch (error) {
    const err = error as { response?: { data?: unknown } };
    throw err.response?.data || "Thêm thẻ flashcard thất bại";
  }
};

const updateFlashcardInSet = async (
  setId: string,
  cardId: string,
  cardData: { question: string; answer: string; difficulty: Difficulty }
) => {
  try {
    const response = await axiosInstance.put(
      API_PATHS.FLASHCARDS.UPDATE_FLASHCARD_IN_SET(setId, cardId),
      cardData
    );
    return response.data;
  } catch (error) {
    const err = error as { response?: { data?: unknown } };
    throw err.response?.data || "Cập nhật thẻ flashcard thất bại";
  }
};

const deleteFlashcardFromSet = async (
  setId: string,
  cardId: string
) => {
  try {
    const response = await axiosInstance.delete(
      API_PATHS.FLASHCARDS.DELETE_FLASHCARD_FROM_SET(setId, cardId)
    );
    return response.data;
  } catch (error) {
    const err = error as { response?: { data?: unknown } };
    throw err.response?.data || "Xóa thẻ flashcard thất bại";
  }
};

const flashcardService = {
  getAllFlashcardSets,
  getAllFlashcardsForDocument,
  reviewFlashcard,
  toggleStarFlashcard,
  deleteFlashcardSet,
  renameFlashcardSet,
  addFlashcardToSet,
  updateFlashcardInSet,
  deleteFlashcardFromSet,
};
export default flashcardService;
