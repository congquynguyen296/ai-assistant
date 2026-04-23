import type { NextFunction, Request, Response } from "express";

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

type MongooseValidationError = Error & {
  name: "ValidationError";
  errors: Record<string, { message: string }>;
};

type MongoDuplicateKeyError = Error & {
  code: number;
  keyValue?: Record<string, string>;
};

type MulterLimitError = Error & {
  code: string;
};

type CastError = Error & {
  name: "CastError";
};

type JwtError = Error & {
  name: "JsonWebTokenError" | "TokenExpiredError";
};

const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): Response => {
  const appError = err as AppError;
  let statusCode = appError.statusCode || 500;
  let message = err.message || "Server Error";

  if ((err as CastError).name === "CastError") {
    statusCode = 404;
    message = "Không tìm thấy tài nguyên";
  }

  if ((err as MongoDuplicateKeyError).code === 11000) {
    const field = Object.keys(
      (err as MongoDuplicateKeyError).keyValue || {},
    )[0];
    statusCode = 400;
    message = `${field} đã tồn tại`;
  }

  if ((err as MongooseValidationError).name === "ValidationError") {
    statusCode = 400;
    message = Object.values((err as MongooseValidationError).errors)
      .map((v) => v.message)
      .join(", ");
  }

  if ((err as MulterLimitError).code === "LIMIT_FILE_SIZE") {
    statusCode = 400;
    message = "Kích thước tài liệu không vượt quá 10MB";
  }

  if ((err as JwtError).name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Token không hợp lệ";
  }

  if ((err as JwtError).name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token hết hạn, vui lòng đăng nhập lại";
  }

  console.log("🔥 Lỗi middleware:", {
    message: err.message,
  });

  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
};

export default errorHandler;
