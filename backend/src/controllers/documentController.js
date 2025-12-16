import {
  uploadDocumentService,
  getDocumentByIdService,
  getDocumentsService,
  updateDocumentService,
  deleteDocumentService,
} from "../services/documentService.js";
import { getUserIdFromReq } from "../utils/authUtil.js";

// @desc    Upload a new document
// @route   POST /api/v1/documents/upload
// @access  Private
export const uploadDocument = async (req, res, next) => {
  try {
    const userId = getUserIdFromReq(req);

    // Get data from req and res body
    const file = req.file;
    if (!file) {
      return res.status(400).json({
        success: false,
        error: "Vui lòng tải lên một file PDF",
        statusCode: 400,
      });
    }

    const { title } = req.body;
    // Clean up uploaded file if data invalid
    if (!title) {
      return res.status(400).json({
        success: false,
        error: "Tiêu đề tài liệu không hợp lệ",
        statusCode: 400,
      });
    }

    // Call service to handle upload
    const result = await uploadDocumentService({ userId, title, file });

    return res.status(201).json({
      success: true,
      message: "Đang tải tài liệu lên...",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a document by documentId
// @route   GET /api/v1/documents/:documentId
// @access  Private
export const getDocumentById = async (req, res, next) => {
  try {
    const userId = getUserIdFromReq(req);

    const documentId = req.params.documentId;
    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: "DocumentId không hợp lệ",
        statusCode: 400,
      });
    }

    const result = await getDocumentByIdService({ userId, documentId });

    return res.status(200).json({
      success: true,
      message: "Lấy tài liệu thành công",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all documents of the user
// @route   GET /api/v1/documents
// @access  Private
export const getDocuments = async (req, res, next) => {
  try {
    const userId = getUserIdFromReq(req);

    const result = await getDocumentsService({ userId });

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách tài liệu thành công",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a document
// @route   PUT /api/v1/documents/:documentId
// @access  Private
export const updateDocument = async (req, res, next) => {
  try {
    const userId = getUserIdFromReq(req);
    const documentId = req.params.documentId;
    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: "DocumentId không hợp lệ",
        statusCode: 400,
      });
    }

    const { title } = req.body;
    if (!title) {
      return res.status(400).json({
        success: false,
        error: "Tiêu đề tài liệu không hợp lệ",
      });
    }
    const result = await updateDocumentService({ documentId, userId, title });

    return res.status(200).json({
      success: true,
      message: "Cập nhật tài liệu thành công",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload a new document
// @route   DELETE /api/v1/documents/:documentId
// @access  Private
export const deleteDocument = async (req, res, next) => {
  try {
    const userId = getUserIdFromReq(req);
    const documentId = req.params.documentId;
    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: "DocumentId không hợp lệ",
        statusCode: 400,
      });
    }

    await deleteDocumentService({ documentId, userId });
    return res.status(200).json({
      success: true,
      message: "Xóa tài liệu thành công",
    });
  } catch (error) {
    next(error);
  }
};
