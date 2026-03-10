import multer from "multer";
import { AppError } from "../middlewares/errorHandle.js";

// Configure storage
const storage = multer.memoryStorage();

// File filter — allow PDF, DOCX, XLSX
const fileFilter = (_req, file, cb) => {
  const allowedMimeTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false);
    cb(new AppError("Chỉ hỗ trợ file PDF, DOCX, XLSX", 400));
  }
};

// Config multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 20 * 1024 * 1024, // 20MB
  },
});

export default upload;
