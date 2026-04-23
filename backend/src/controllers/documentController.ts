import type { Response, NextFunction } from "express";
import {
  uploadDocumentService,
  getDocumentByIdService,
  getDocumentsService,
  updateDocumentService,
  deleteDocumentService,
} from "../services/documentService.js";
import { getUserIdFromReq } from "@/utils/authUtil.js";
import type { AuthRequest } from "@/types/request.js";
import type { UploadDocumentRequestDto } from "@/dtos/documents/upload.request.dto.js";
import type { UpdateDocumentRequestDto } from "@/dtos/documents/update.request.dto.js";

export const uploadDocument = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const userId = getUserIdFromReq(req);

    const file = req.file;
    if (!file) {
      return res.status(400).json({
        success: false,
        error: "Vui lòng tải lên một file PDF",
        statusCode: 400,
      });
    }

    const { title } = req.body as UploadDocumentRequestDto;
    if (!title) {
      return res.status(400).json({
        success: false,
        error: "Tiêu đề tài liệu không hợp lệ",
        statusCode: 400,
      });
    }

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

export const getDocumentById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
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

export const getDocuments = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
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

export const updateDocument = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
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

    const { title } = req.body as UpdateDocumentRequestDto;
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

export const deleteDocument = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
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
