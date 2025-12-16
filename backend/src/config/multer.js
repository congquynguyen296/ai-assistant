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

// File filter — only PDFs
const fileFilter = (_req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(null, false);
    throw new AppError("Chỉ hỗ trợ upload file PDF", 400);
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
