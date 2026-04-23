import multer, { type FileFilterCallback } from "multer";
import type { Request } from "express";
import { AppError } from "@/middlewares/errorHandle.js";

const storage = multer.memoryStorage();

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
): void => {
  const allowedMimeTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false);
    cb(new AppError("Chỉ hỗ trợ file PDF, DOCX, XLSX", 400));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: Number.parseInt(process.env.MAX_FILE_SIZE || "", 10) ||
      20 * 1024 * 1024,
  },
});

export default upload;
