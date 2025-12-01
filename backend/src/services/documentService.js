import mongoose from "mongoose";
import Document from "../models/Document.js";
import Flashcard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";
import fs from "fs/promises";
import { extractTextFromPDF } from "../utils/pdfParser.js";
import { chunkText } from "../utils/textChunker.js";
import { AppError } from "../middlewares/errorHandle.js";

export const uploadDocumentService = async ({ userId, title, file }) => {
  // Construct file URL
  const baseUrl = `${process.env.APP_HOST || "localhost"}:${
    process.env.APP_PORT || 8000
  }`;
  const fileUrl = `${baseUrl}/uploads/documents/${file.filename}`;

  // Create new document record
  const document = await Document.create({
    userId,
    title,
    fileUrl,
    fileName: file.originalname,
    filePath: file.path,
    fileSize: file.size,
    status: "processing",
  });

  // Process document in backgroud - use RMQ
  processDocument(document._id, file.path).catch((error) => {
    console.error("Lỗi khi tải tài liệu: ", error);
  });

  return document;
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

  return {
    ...document.toObject(),
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

  return {
    documents,
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

  return document;
};

export const deleteDocumentService = async ({ documentId, userId }) => {
  const document = await Document.findOne({ _id: documentId, userId });
  if (!document) {
    throw new AppError("Tài liệu không tồn tại", 404);
  }

  // Delete file from storange
  await fs.unlink(document.filePath).catch((error) => {
    console.error("Lỗi khi xóa file tài liệu: ", error);
  });

  // Optionally, delete related flashcards and quizzes
  await Flashcard.deleteMany({ documentId: document._id, userId });
  await Quiz.deleteMany({ documentId: document._id, userId });

  // Delete document record
  await document.deleteOne();
};

// Helper function to process document in background
const processDocument = async (documentId, filePath) => {
  try {
    const { text } = await extractTextFromPDF(filePath);

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
