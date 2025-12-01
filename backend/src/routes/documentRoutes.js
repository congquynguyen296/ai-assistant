import express from "express";
import protect from "../middlewares/auth.js";
import upload from "../config/multer.js";
import {
  uploadDocument,
  getDocumentById,
  getDocuments,
  updateDocument,
  deleteDocument,
} from "../controllers/documentController.js";

const router = express.Router();

// All routes are protected
router.use(protect);

router.post("/upload", upload.single("file"), uploadDocument);

router.get("/", getDocuments);

router.get("/:documentId", getDocumentById);

router.put("/:documentId", updateDocument);

router.delete("/:documentId", deleteDocument);

export default router;
