import mongoose from "mongoose";
import Document from "../models/Document.js";
import Flashcard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";
import { extractTextFromPDF } from "../utils/pdfParser.js";
import {
  extractTextFromDOCX,
  extractTextFromExcel,
} from "../utils/officeParser.js";
import { chunkText } from "../utils/textChunker.js";
import { AppError } from "../middlewares/errorHandle.js";
import supabase from "../config/supabase.js";
import { redisService } from "./redisService.js";

const BUCKET_NAME = "documents";

/**
 * Helper: Generate Signed URL for Supabase Storage
 * @param {string} storagePath
 * @param {number} expiresIn Seconds (default 1h)
 */
export const generateSignedUrl = async (storagePath, expiresIn = 3600) => {
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

// TODO:
// 1. Add pagination for getDocumentsService
// 2. Refactor to use Redis for caching document metadata and extracted text for faster access
// 3. Implement background job processing (e.g., BullMQ) for document processing to improve responsiveness
export const uploadDocumentService = async ({ userId, title, file }) => {
  // Generate a new ObjectId for the document
  const documentId = new mongoose.Types.ObjectId();

  // === NEW SUPABASE LOGIC ===
  // Create unique path: userId/timestamp_filename
  // Sanitize filename to act as a clean storage key
  const sanitizedFileName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
  const storagePath = `${userId}/${Date.now()}_${sanitizedFileName}`;

  try {
    const { data, error } = await supabase.storage
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

  // Generate a temporary signed URL to return immediately
  const signedUrl = await generateSignedUrl(storagePath);

  // Create new document record
  const document = await Document.create({
    _id: documentId,
    userId,
    title,
    fileUrl: null,
    fileName: file.originalname,
    filePath: storagePath, // Path in Supabase bucket
    fileSize: file.size,
    mimeType: file.mimetype,
    status: "processing",
  });

  // Invalidate documents list cache
  await invalidateDocumentsListCache(userId);

  // Process document in background (extract text, etc.)
  // Note: Support PDF, DOCX, XLSX
  processDocument(document._id, file.buffer, file.mimetype).catch((error) => {
    console.error("Lỗi khi tải tài liệu: ", error);
  });

  // Return object with the signed URL
  return {
    ...document.toObject(),
    fileUrl: signedUrl,
  };
};

export const getDocumentByIdService = async ({ userId, documentId }) => {
  // Check in redis cache first
  const cacheKey = `document:${userId}:${documentId}`;
  const cacheData = await redisService.getObject(cacheKey);

  if (cacheData) {
    console.log(`Cache HIT for document ${documentId} (key: ${cacheKey})`);
    return cacheData;
  }

  // If not found, query MongoDB
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

  // Get count of flashcards and quizzes
  const flashcardCount = await Flashcard.countDocuments({
    documentId: document._id,
    userId,
  });
  const quizCount = await Quiz.countDocuments({
    documentId: document._id,
    userId,
  });

  // Update last accessed
  document.lastAccessed = Date.now();
  await document.save();

  // Resolve file URL (handle both Cloudinary and Supabase)
  let finalUrl = document.fileUrl;
  if (!finalUrl && document.filePath) {
    finalUrl = await generateSignedUrl(document.filePath);
  }

  const response = {
    ...document.toObject(),
    fileUrl: finalUrl,
    flashcardCount,
    quizCount,
  };

  if (response._id) {
    try {
      await redisService.setObject(cacheKey, response);
      console.log(`Document ${documentId} cached in Redis (key: ${cacheKey})`);
    } catch (cacheErr) {
      console.warn(`Failed to cache document ${documentId}:`, cacheErr.message);
    }
  }

  return response;
};

export const getDocumentsService = async ({ userId }) => {
  // Check in redis cache first
  const cacheKey = `documents:${userId}`;
  const cacheDate = await redisService.getObject(cacheKey);

  if (cacheDate) {
    console.log(`Cache HIT for documents list (key: ${cacheKey})`);
    return cacheDate;
  }

  console.log(
    `Cache MISS for documents list (key: ${cacheKey}), querying MongoDB`,
  );
  const documents = await Document.aggregate([
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
  ]);

  // Map to add signed URLs for Supabase docs
  const documentsWithUrls = await Promise.all(
    documents.map(async (doc) => {
      let url = doc.fileUrl;
      // If fileUrl is missing (new Supabase flow), generate signed URL
      if (!url && doc.filePath) {
        url = await generateSignedUrl(doc.filePath);
      }
      return { ...doc, fileUrl: url };
    }),
  );

  const response = {
    documents: documentsWithUrls,
    count: documents.length,
  };

  if (response.count > 0) {
    try {
      await redisService.setObject(cacheKey, response);
      console.log(`Documents list cached in Redis (key: ${cacheKey}), count: ${response.count}`);
    } catch (cacheErr) {
      console.warn(`Failed to cache documents list:`, cacheErr.message);
    }
  } else {
    console.log(`Documents list is empty (key: ${cacheKey}), skipping cache.`);
  }

  return response;
};

export const updateDocumentService = async ({ documentId, userId, title }) => {
  const document = await Document.findOne({ _id: documentId, userId });
  if (!document) {
    throw new AppError("Tài liệu không tồn tại", 404);
  }

  // Update title
  document.title = title || document.title;
  await document.save();

  // Invalidate documents list cache
  await invalidateDocumentsListCache(userId);

  // Invalidate document detail cache
  const cacheKey = `document:${userId}:${documentId}`;
  await redisService.deleteObject(cacheKey);
  console.log(`Invalidated cache for document ${documentId} (key: ${cacheKey})`);

  // Return with Signed URL if needed
  let finalUrl = document.fileUrl;
  if (!finalUrl && document.filePath) {
    finalUrl = await generateSignedUrl(document.filePath);
  }

  return { ...document.toObject(), fileUrl: finalUrl };
};

export const deleteDocumentService = async ({ documentId, userId }) => {
  const document = await Document.findOne({ _id: documentId, userId });
  if (!document) {
    throw new AppError("Tài liệu không tồn tại", 404);
  }

  // Delete file from Storage
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

  // Optionally, delete related flashcards and quizzes
  await Flashcard.deleteMany({ documentId: document._id, userId });
  await Quiz.deleteMany({ documentId: document._id, userId });

  // Delete document record
  await document.deleteOne();

  // Invalidate documents list cache
  await invalidateDocumentsListCache(userId);
};

// Helper function to invalidate documents list cache for a user
const invalidateDocumentsListCache = async (userId) => {
  const cacheKey = `documents:${userId}`;
  try {
    await redisService.deleteObject(cacheKey);
    console.log(`Invalidated documents list cache (key: ${cacheKey})`);
  } catch (error) {
    // Do not block the main flow if cache invalidation fails.
    console.error(
      `Failed to invalidate documents cache (key: ${cacheKey})`,
      error,
    );
  }
};

// Helper function to process document in background
const processDocument = async (documentId, fileBuffer, mimeType) => {
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

    // Create chunks
    const chunks = chunkText(text, 500, 50);

    // Update document with chunks
    await Document.findByIdAndUpdate(documentId, {
      chunks,
      extractedText: text,
      status: "ready",
    });

    console.log(`Xử lý tài liệu ${documentId} hoàn tất`);
  } catch (error) {
    console.error("Lỗi khi xử lý tài liệu: ", error);

    // Update status
    await Document.findByIdAndUpdate(documentId, { status: "failed" });
  }
};
