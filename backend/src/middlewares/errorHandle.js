export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Server Error";

  // Invalid MongoDB ObjectId
  if (err.name === "CastError") {
    statusCode = 404;
    message = "Không tìm thấy tài nguyên";
  }

  // Duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    statusCode = 400;
    message = `${field} đã tồn tại`;
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((v) => v.message)
      .join(", ");
  }

  // Multer file size error
  if (err.code === "LIMIT_FILE_SIZE") {
    statusCode = 400;
    message = "Kích thước tài liệu không vượt quá 10MB";
  }

  // JWT - invalid token
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Token không hợp lệ";
  }

  // JWT - expired token
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token hết hạn, vui lòng đăng nhập lại";
  }

  console.log("🔥 Lỗi middleware:", {
    message: err.message,
    // stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });

  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    // ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export default errorHandler;
