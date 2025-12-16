import mongoose from "mongoose";
import Document from "../models/Document.js";
import Flashcard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";
import { extractTextFromPDF } from "../utils/pdfParser.js";
import { chunkText } from "../utils/textChunker.js";
import { AppError } from "../middlewares/errorHandle.js";
import cloudinary from "../config/cloudinary.js";
import { Readable } from "stream";

export const uploadDocumentService = async ({ userId, title, file }) => {
  // Generate a new ObjectId for the document
  const documentId = new mongoose.Types.ObjectId();

  // Upload to Cloudinary
  const uploadStream = (buffer) => {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          public_id: documentId.toString(), // Just the ID, let folder/asset_folder handle the path
          folder: `hyra/${userId}`, // For URL structure (legacy/standard)
          asset_folder: `hyra/${userId}`, // For Media Library folder structure (new)
          resource_type: "auto",
          overwrite: true,
          unique_filename: false,
        },
        (error, result) => {
          if (error) {
            console.error("[Upload] Cloudinary Error:", error);
            return reject(error);
          }
          resolve(result);
        }
      );
      Readable.from(buffer).pipe(stream);
    });
  };

  let uploadResult;
  try {
    uploadResult = await uploadStream(file.buffer);
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new AppError("Lỗi khi upload file lên Cloudinary", 500);
  }

  // Create new document record
  const document = await Document.create({
    _id: documentId,
    userId,
    title,
    fileUrl: uploadResult.secure_url,
    fileName: file.originalname,
    filePath: uploadResult.public_id, // Store public_id for deletion
    fileSize: file.size,
    status: "processing",
  });

  // Process document in backgroud
  processDocument(document._id, file.buffer).catch((error) => {
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

  // Delete file from Cloudinary
  if (document.filePath) {
    try {
      // Try deleting as image (default for auto/pdf)
      await cloudinary.uploader.destroy(document.filePath);
      // If it was raw, we might need to specify resource_type: 'raw'
      // But since we used 'auto', it's likely 'image' or 'raw'.
      // We can try both or just ignore error.
    } catch (error) {
      console.error("Lỗi khi xóa file trên Cloudinary: ", error);
    }
  }

  // Optionally, delete related flashcards and quizzes
  await Flashcard.deleteMany({ documentId: document._id, userId });
  await Quiz.deleteMany({ documentId: document._id, userId });

  // Delete document record
  await document.deleteOne();
};

// Helper function to process document in background
const processDocument = async (documentId, fileBuffer) => {
  try {
    const { text } = await extractTextFromPDF(fileBuffer);

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
