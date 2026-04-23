import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import errorHandler from "@/middlewares/errorHandle.js";
import connectDB from "@/config/db.js";
import { connectRedis } from "@/config/redis.js";
import authRoutes from "@/routes/authRoutes.js";
import documentRoutes from "@/routes/documentRoutes.js";
import flashcardRoutes from "@/routes/flashcardRoutes.js";
import aiRoutes from "@/routes/aiRoutes.js";
import quizRoutes from "@/routes/quizRoutes.js";
import processRoutes from "@/routes/progressRoute.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

await connectDB();

await connectRedis();

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        "https://hyra-six.vercel.app",
        "http://localhost:5173",
        "http://localhost:3000",
      ];

      if (origin.endsWith(".vercel.app") || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

app.get("/health-check", (_req: Request, res: Response) => {
  res.status(200).send("OK");
});

app.use("/uploads", express.static(path.join(__dirname, "src", "uploads")));

app.use(`${process.env.API_PREFIX}/auth`, authRoutes);
app.use(`${process.env.API_PREFIX}/documents`, documentRoutes);
app.use(`${process.env.API_PREFIX}/flashcards`, flashcardRoutes);
app.use(`${process.env.API_PREFIX}/quizzes`, quizRoutes);
app.use(`${process.env.API_PREFIX}/ai-generation`, aiRoutes);
app.use(`${process.env.API_PREFIX}/progress`, processRoutes);

app.use(errorHandler);

app.use((_req: Request, res: Response, _next: NextFunction) => {
  res.status(404).json({
    error: "Không tìm thấy đường dẫn",
    statusCode: 404,
    sucess: false,
  });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server đang chạy ở cổng: ${PORT}`);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err.message);
  process.exit(1);
});
