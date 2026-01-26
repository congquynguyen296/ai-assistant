import mongoose from "mongoose";
import Document from "../models/Document.js";
import Flashcard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";
import { extractTextFromPDF } from "../utils/pdfParser.js";
import { extractTextFromDOCX, extractTextFromExcel } from "../utils/officeParser.js";
import { chunkText } from "../utils/textChunker.js";
import { AppError } from "../middlewares/errorHandle.js";
// import cloudinary from "../config/cloudinary.js"; // Old Cloudinary config
import supabase from "../config/supabase.js"; // New Supabase config

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

export const uploadDocumentService = async ({ userId, title, file }) => {
  // Generate a new ObjectId for the document
  const documentId = new mongoose.Types.ObjectId();

  /* === REMOVED CLOUDINARY LOGIC ===
  const uploadStream = (buffer) => {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(...)
      Readable.from(buffer).pipe(stream);
    });
  };
  */

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
    // For Supabase, we don't store permanent URL.
    // Legacy Cloudinary docs have fileUrl. New ones will have it null/undefined in DB.
    fileUrl: null, 
    fileName: file.originalname,
    filePath: storagePath, // Path in Supabase bucket
    fileSize: file.size,
    mimeType: file.mimetype,
    status: "processing",
  });

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

  // Determine URL (Legacy Cloudinary vs New Supabase)
  let finalUrl = document.fileUrl;
  // If fileUrl is null (Post-migration) AND we have filePath, use Supabase Signed URL
  if (!finalUrl && document.filePath) {
    finalUrl = await generateSignedUrl(document.filePath);
  }

  return {
    ...document.toObject(),
    fileUrl: finalUrl,
    flashcardCount,
    quizCount,
  };
};

export const getDocumentsService = async ({ userId }) => {
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
    })
  );

  return {
    documents: documentsWithUrls,
    count: documents.length,
  };
};

export const updateDocumentService = async ({ documentId, userId, title }) => {
  const document = await Document.findOne({ _id: documentId, userId });
  if (!document) {
    throw new AppError("Tài liệu không tồn tại", 404);
  }

  // Update title
  document.title = title || document.title;
  await document.save();

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
    // Check if Cloudinary (has fileUrl) or Supabase (no fileUrl)
    if (document.fileUrl) {
      /* === OLD CLOUDINARY ===
      try {
        await cloudinary.uploader.destroy(document.filePath);
      } catch (error) { ... }
      */
    } else {
      // === NEW SUPABASE ===
      try {
        const { error } = await supabase.storage
          .from(BUCKET_NAME)
          .remove([document.filePath]);
        if (error) console.error("Supabase delete error:", error);
      } catch (error) {
        console.error("Lỗi khi xóa file trên Supabase: ", error);
      }
    }
  }

  // Optionally, delete related flashcards and quizzes
  await Flashcard.deleteMany({ documentId: document._id, userId });
  await Quiz.deleteMany({ documentId: document._id, userId });

  // Delete document record
  await document.deleteOne();
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
