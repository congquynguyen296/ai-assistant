import express from "express";
import { body } from "express-validator";
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
} from "../controllers/authController.js";
import protect from "../middlewares/auth.js";

const router = express.Router();

// Validation rules
const registerValidation = [
  body("username")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Tên đăng nhập phải có ít nhất 3 ký tự"),
  body("email").isEmail().withMessage("Email không hợp lệ").normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Mật khẩu phải có ít nhất 6 ký tự"),
];

const loginValidation = [
  body("email").isEmail().withMessage("Email không hợp lệ").normalizeEmail(),
  body("password").notEmpty().withMessage("Mật khẩu không được để trống"),
];

// Public routes
router.post("/register", registerValidation, register);

router.post("/login", loginValidation, login);

// Protected routes
router.get("/profile", protect, getProfile);

router.put("/profile", protect, updateProfile);

router.put("/change-password", protect, changePassword);

export default router;
