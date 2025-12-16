import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import errorHandler from "./src/middlewares/errorHandle.js";
import connectDB from "./src/config/db.js";
import { connectRedis } from "./src/config/redis.js";
import authRoutes from "./src/routes/authRoutes.js";
import documentRoutes from "./src/routes/documentRoutes.js";
import flashcardRoutes from "./src/routes/flashcardRoutes.js";
import aiRoutes from "./src/routes/aiRoutes.js";
import quizRoutes from "./src/routes/quizRoutes.js";
import processRoutes from "./src/routes/progressRoute.js";

// Load env variables
dotenv.config();

// ES6 module __dirname alternative
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Init app
const app = express();

// Connect db
await connectDB();
// Connect Redis
await connectRedis();

// Middleware to handle cors
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder for uploads
app.use("/uploads", express.static(path.join(__dirname, "src", "uploads")));

// Routes
app.use(`${process.env.API_PREFIX}/auth`, authRoutes);
app.use(`${process.env.API_PREFIX}/documents`, documentRoutes);
app.use(`${process.env.API_PREFIX}/flashcards`, flashcardRoutes);
app.use(`${process.env.API_PREFIX}/quizzes`, quizRoutes);
app.use(`${process.env.API_PREFIX}/ai-generation`, aiRoutes);
app.use(`${process.env.API_PREFIX}/progress`, processRoutes);

// Globle error handler
app.use(errorHandler);

// 404 handle
app.use((req, res, next) => {
  res.status(404).json({
    error: "Không tìm thấy đường dẫn",
    statusCode: 404,
    sucess: false,
  });
});

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server đang chạy ở cổng: ${PORT}`);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err.message);
  process.exit(1);
});
