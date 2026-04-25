import axiosInstance from "@/utils/axiosInstance";
import { API_PATHS } from "@/utils/apiPath";
import type {
  DocumentDetailResponse,
  DocumentListResponse,
} from "@/types/api.types";

const getDocuments = async (): Promise<DocumentListResponse> => {
  try {
    const response = await axiosInstance.get<DocumentListResponse>(
      API_PATHS.DOCUMENTS.GET_DOCUMENTS
    );
    return response.data;
  } catch (error) {
    const err = error as { response?: { data?: unknown } };
    throw err.response?.data || "Lấy danh sách tài liệu thất bại";
  }
};

const uploadDocument = async (
  formData: FormData
): Promise<DocumentDetailResponse> => {
  try {
    const response = await axiosInstance.post<DocumentDetailResponse>(
      API_PATHS.DOCUMENTS.UPLOAD,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    const err = error as { response?: { data?: unknown } };
    throw err.response?.data || "Tải tài liệu thất bại";
  }
};

const deleteDocument = async (
  documentId: string
): Promise<DocumentDetailResponse> => {
  try {
    const response = await axiosInstance.delete<DocumentDetailResponse>(
      API_PATHS.DOCUMENTS.DELETE_DOCUMENT(documentId)
    );
    return response.data;
  } catch (error) {
    console.error("Xóa tài liệu thất bại:", error);
    const err = error as { response?: { data?: unknown } };
    throw err.response?.data || "Xóa tài liệu thất bại";
  }
};

const renameDocument = async (
  documentId: string,
  title: string
): Promise<DocumentDetailResponse> => {
  try {
    const response = await axiosInstance.put<DocumentDetailResponse>(
      API_PATHS.DOCUMENTS.RENAME_DOCUMENT(documentId),
      { title }
    );
    return response.data;
  } catch (error) {
    const err = error as { response?: { data?: unknown } };
    throw err.response?.data || "Đổi tên tài liệu thất bại";
  }
};

const getDocumentById = async (
  documentId: string
): Promise<DocumentDetailResponse> => {
  try {
    const response = await axiosInstance.get<DocumentDetailResponse>(
      API_PATHS.DOCUMENTS.GET_DOCUMENT_BY_ID(documentId)
    );
    return response.data;
  } catch (error) {
    const err = error as { response?: { data?: unknown } };
    throw err.response?.data || "Lấy tài liệu thất bại";
  }
};

const documentService = {
  getDocuments,
  uploadDocument,
  deleteDocument,
  getDocumentById,
  renameDocument,
};
export default documentService;
