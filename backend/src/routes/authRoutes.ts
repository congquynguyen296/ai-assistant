import express from "express";
import { body } from "express-validator";
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  googleLogin,
  confirmEmail,
  resendOTP,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import protect from "@/middlewares/auth.js";
import { authLimiter, otpLimiter } from "@/middlewares/rateLimiter.js";

const router = express.Router();

const registerValidation = [
  body("username")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Tên đăng nhập phải có ít nhất 3 ký tự"),
  body("email").isEmail().withMessage("Email không hợp lệ").toLowerCase(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Mật khẩu phải có ít nhất 6 ký tự"),
];

const loginValidation = [
  body("email").isEmail().withMessage("Email không hợp lệ").toLowerCase(),
  body("password").notEmpty().withMessage("Mật khẩu không được để trống"),
];

router.post("/register", authLimiter, registerValidation, register);

router.post("/confirm-email", otpLimiter, confirmEmail);

router.post("/resend-otp", otpLimiter, resendOTP);

router.post("/forgot-password", otpLimiter, forgotPassword);
router.post("/reset-password", otpLimiter, resetPassword);

router.post("/login", authLimiter, loginValidation, login);

router.post("/google-login", authLimiter, googleLogin);

router.get("/profile", protect, getProfile);

router.put("/profile", protect, updateProfile);

router.put("/change-password", protect, changePassword);

export default router;
