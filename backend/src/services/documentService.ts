import mongoose from "mongoose";
import Document from "@/models/Document.js";
import Flashcard from "@/models/Flashcard.js";
import Quiz from "@/models/Quiz.js";
import { extractTextFromPDF } from "@/utils/pdfParser.js";
import {
  extractTextFromDOCX,
  extractTextFromExcel,
} from "@/utils/officeParser.js";
import { chunkText, type TextChunk } from "@/utils/textChunker.js";
import { AppError } from "@/middlewares/errorHandle.js";
import supabase from "@/config/supabase.js";
import { redisService } from "@/services/redisService.js";
import { ingestDocument, deleteDocumentVectors } from "@/services/ragClientService.js";
import { mapDocumentResponse } from "@/utils/dtoMapper.js";
import type {
  DocumentListResponseDto,
  DocumentResponseDto,
} from "@/dtos/documents/document.response.dto.js";

const BUCKET_NAME = "documents";

export const generateSignedUrl = async (
  storagePath: string,
  expiresIn = 3600,
): Promise<string | null> => {
  try {
    if (!storagePath) return null;
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(storagePath, expiresIn);

    if (error) throw error;
    return data.signedUrl;
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return null;
  }
};

export const uploadDocumentService = async (input: {
  userId: string;
  title: string;
  file: Express.Multer.File;
}): Promise<DocumentResponseDto> => {
  const { userId, title, file } = input;
  const documentId = new mongoose.Types.ObjectId();

  const sanitizedFileName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
  const storagePath = `${userId}/${Date.now()}_${sanitizedFileName}`;

  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) throw error;
  } catch (error) {
    console.error("Supabase upload error:", error);
    throw new AppError("Lỗi khi upload file lên Storage", 500);
  }

  const signedUrl = await generateSignedUrl(storagePath);

  const document = await Document.create({
    _id: documentId,
    userId,
    title,
    fileUrl: null,
    fileName: file.originalname,
    filePath: storagePath,
    fileSize: file.size,
    mimeType: file.mimetype,
    status: "processing",
  });

  await invalidateDocumentsListCache(userId);

  processDocument(document._id.toString(), file.buffer, file.mimetype).catch(
    (error) => {
      console.error("Lỗi khi tải tài liệu: ", error);
    },
  );

  return mapDocumentResponse({
    ...document.toObject(),
    fileUrl: signedUrl,
  });
};

export const getDocumentByIdService = async (input: {
  userId: string;
  documentId: string;
}): Promise<DocumentResponseDto> => {
  const { userId, documentId } = input;
  const cacheKey = `document:${userId}:${documentId}`;
  const cacheData = await redisService.getObject<DocumentResponseDto>(
    cacheKey,
  );

  if (cacheData) {
    console.log(`Cache HIT for document ${documentId} (key: ${cacheKey})`);
    return cacheData;
  }

  console.log(
    `Cache MISS for document ${documentId} (key: ${cacheKey}), querying MongoDB`,
  );
  const document = await Document.findOne({
    _id: documentId,
    userId,
  });

  if (!document) {
    throw new AppError("Tài liệu không tồn tại", 404);
  }

  const flashcardCount = await Flashcard.countDocuments({
    documentId: document._id,
    userId,
  });
  const quizCount = await Quiz.countDocuments({
    documentId: document._id,
    userId,
  });

  document.lastAccessed = new Date();
  await document.save();

  let finalUrl = document.fileUrl;
  if (!finalUrl && document.filePath) {
    finalUrl = await generateSignedUrl(document.filePath);
  }

  const response = mapDocumentResponse({
    ...document.toObject(),
    fileUrl: finalUrl,
    flashcardCount,
    quizCount,
  });

  if (response._id) {
    try {
      await redisService.setObject(cacheKey, response);
      console.log(`Document ${documentId} cached in Redis (key: ${cacheKey})`);
    } catch (cacheErr) {
      console.warn(`Failed to cache document ${documentId}:`, (cacheErr as Error).message);
    }
  }

  return response;
};

export const getDocumentsService = async (input: {
  userId: string;
}): Promise<DocumentListResponseDto> => {
  const { userId } = input;
  const cacheKey = `documents:${userId}`;
  const cacheDate = await redisService.getObject<DocumentListResponseDto>(
    cacheKey,
  );

  if (cacheDate) {
    console.log(`Cache HIT for documents list (key: ${cacheKey})`);
    return cacheDate;
  }

  console.log(
    `Cache MISS for documents list (key: ${cacheKey}), querying MongoDB`,
  );
  const documents = (await Document.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $lookup: {
        from: "flashcards",
        localField: "_id",
        foreignField: "documentId",
        as: "flashcardSets",
      },
    },
    {
      $lookup: {
        from: "quizzes",
        localField: "_id",
        foreignField: "documentId",
        as: "quizzes",
      },
    },
    {
      $addFields: {
        flashcardCount: { $size: "$flashcardSets" },
        quizCount: { $size: "$quizzes" },
      },
    },
    {
      $project: {
        extractedText: 0,
        chunks: 0,
        flashcardSets: 0,
        quizzes: 0,
      },
    },
    { $sort: { uploadDate: -1 } },
  ])) as Array<Record<string, unknown>>;

  const documentsWithUrls = await Promise.all(
    documents.map(async (doc) => {
      const fileUrl = doc.fileUrl as string | null | undefined;
      const filePath = doc.filePath as string | undefined;
      let url = fileUrl;
      if (!url && filePath) {
        url = await generateSignedUrl(filePath);
      }
      return mapDocumentResponse({ ...doc, fileUrl: url });
    }),
  );

  const response: DocumentListResponseDto = {
    documents: documentsWithUrls,
    count: documents.length,
  };

  if (response.count > 0) {
    try {
      await redisService.setObject(cacheKey, response);
      console.log(
        `Documents list cached in Redis (key: ${cacheKey}), count: ${response.count}`,
      );
    } catch (cacheErr) {
      console.warn(`Failed to cache documents list:`, (cacheErr as Error).message);
    }
  } else {
    console.log(`Documents list is empty (key: ${cacheKey}), skipping cache.`);
  }

  return response;
};

export const updateDocumentService = async (input: {
  documentId: string;
  userId: string;
  title: string;
}): Promise<DocumentResponseDto> => {
  const { documentId, userId, title } = input;
  const document = await Document.findOne({ _id: documentId, userId });
  if (!document) {
    throw new AppError("Tài liệu không tồn tại", 404);
  }

  document.title = title || document.title;
  await document.save();

  await invalidateDocumentsListCache(userId);

  const cacheKey = `document:${userId}:${documentId}`;
  await redisService.deleteObject(cacheKey);
  console.log(`Invalidated cache for document ${documentId} (key: ${cacheKey})`);

  let finalUrl = document.fileUrl;
  if (!finalUrl && document.filePath) {
    finalUrl = await generateSignedUrl(document.filePath);
  }

  return mapDocumentResponse({ ...document.toObject(), fileUrl: finalUrl });
};

export const deleteDocumentService = async (input: {
  documentId: string;
  userId: string;
}): Promise<void> => {
  const { documentId, userId } = input;
  const document = await Document.findOne({ _id: documentId, userId });
  if (!document) {
    throw new AppError("Tài liệu không tồn tại", 404);
  }

  if (document.filePath) {
    try {
      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([document.filePath]);
      if (error) console.error("Supabase delete error:", error);
    } catch (error) {
      console.error("Lỗi khi xóa file trên Supabase: ", error);
    }
  }

  await Flashcard.deleteMany({ documentId: document._id, userId });
  await Quiz.deleteMany({ documentId: document._id, userId });

  await document.deleteOne();

  deleteDocumentVectors(String(documentId)).catch((err) => {
    console.error(
      `[RAG] deleteDocumentVectors failed for ${documentId}:`,
      (err as Error).message,
    );
  });

  await invalidateDocumentsListCache(userId);
};

const invalidateDocumentsListCache = async (userId: string): Promise<void> => {
  const cacheKey = `documents:${userId}`;
  try {
    await redisService.deleteObject(cacheKey);
    console.log(`Invalidated documents list cache (key: ${cacheKey})`);
  } catch (error) {
    console.error(
      `Failed to invalidate documents cache (key: ${cacheKey})`,
      error,
    );
  }
};

const processDocument = async (
  documentId: string,
  fileBuffer: Buffer,
  mimeType: string,
): Promise<void> => {
  try {
    let text = "";
    if (mimeType === "application/pdf") {
      const result = await extractTextFromPDF(fileBuffer);
      text = result.text;
    } else if (
      mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      text = await extractTextFromDOCX(fileBuffer);
    } else if (
      mimeType ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      text = await extractTextFromExcel(fileBuffer);
    }

    if (!text) {
      throw new Error("Không thể trích xuất văn bản từ tài liệu này.");
    }

    const chunks: TextChunk[] = chunkText(text, 500, 50);

    await Document.findByIdAndUpdate(documentId, {
      chunks,
      extractedText: text,
      status: "ready",
    });

    console.log(`Xử lý tài liệu ${documentId} hoàn tất`);

    const ragDoc = await Document.findById(documentId).select("fileName").lean();
    ingestDocument(
      String(documentId),
      (ragDoc?.fileName as string) || "unknown",
      text,
    ).catch((err) => {
      console.error(
        `[RAG] ingestDocument failed for ${documentId}:`,
        (err as Error).message,
      );
    });
  } catch (error) {
    console.error("Lỗi khi xử lý tài liệu: ", error);

    await Document.findByIdAndUpdate(documentId, { status: "failed" });
  }
};
