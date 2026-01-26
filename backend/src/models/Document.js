import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Tiêu đề tài liệu không được để trống"],
      trim: true,
    },
    fileName: {
      type: String,
      required: [true, "Tên file không được để trống"],
      trim: true,
    },
    filePath: {
      type: String,
      required: [true, "Đường dẫn storage path không được để trống"],
    }, // Path in Supabase Storage (e.g., userId/file.pdf)
    fileUrl: {
      type: String,
      // URL is dynamic (Signed URL), not stored permanently
    }, 
    mimeType: {
      type: String,
      default: "application/pdf"
    },
    fileSize: {
      type: Number,
      required: true,
    },
    extractedText: {
      type: String,
      default: "",
    },
    chunks: [
      {
        content: {
          type: String,
          required: true,
        },
        pageNumber: {
          type: Number,
          default: 0,
        },
        chunkIndex: {
          type: Number,
          required: true,
        },
      },
    ],
    uploadDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["processing", "ready", "failed"],
    },
    lastAccessed: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

documentSchema.index({ userId: 1, uploadDate: -1 });

const Document = mongoose.model("Document", documentSchema);
export default Document;
