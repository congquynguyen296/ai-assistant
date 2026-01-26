import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { AppError } from "../middlewares/errorHandle.js";

// Resolve dirname in ESModules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create upload directory
// const uploadDir = path.join(__dirname, "../uploads/documents");
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

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
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
  },
});

export default upload;
