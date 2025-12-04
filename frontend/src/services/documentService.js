import axiosInstance from "@/utils/axiosInstance.js";
import { API_PATHS } from "@/utils/apiPath.js";

const getDocuments = async () => {
  try {
    const response = await axiosInstance.get(API_PATHS.DOCUMENTS.GET_DOCUMENTS);
    return response.data;
  } catch (error) {
    throw error.response?.data || "Lấy danh sách tài liệu thất bại";
  }
};

const uploadDocument = async (formData) => {
  try {
    const response = await axiosInstance.post(
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
    throw error.response?.data || "Tải tài liệu thất bại";
  }
};

const deleteDocument = async (documentId) => {
  try {
    const response = await axiosInstance.delete(
      API_PATHS.DOCUMENTS.DELETE_DOCUMENT(documentId)
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || "Xóa tài liệu thất bại";
  }
};

const getDocumentById = async (documentId) => {
  try {
    const response = await axiosInstance.get(
      API_PATHS.DOCUMENTS.GET_DOCUMENT_BY_ID(documentId)
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || "Lấy tài liệu thất bại";
  }
};

const documentService = {
  getDocuments,
  uploadDocument,
  deleteDocument,
  getDocumentById,
};
export default documentService;
