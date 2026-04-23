import type { Request, Response, NextFunction } from "express";
import {
  registerService,
  loginService,
  getProfileService,
  updateProfileService,
  changePasswordService,
  googleLoginService,
  confirmEmailService,
  resendOTPService,
} from "../services/authService.js";
import type { AuthRequest } from "@/types/request.js";
import type { RegisterRequestDto } from "@/dtos/auth/register.request.dto.js";
import type { LoginRequestDto } from "@/dtos/auth/login.request.dto.js";
import type { ConfirmEmailRequestDto } from "@/dtos/auth/confirm-email.request.dto.js";
import type { ResendOtpRequestDto } from "@/dtos/auth/resend-otp.request.dto.js";
import type { GoogleLoginRequestDto } from "@/dtos/auth/google-login.request.dto.js";
import type { UpdateProfileRequestDto } from "@/dtos/auth/update-profile.request.dto.js";
import type { ChangePasswordRequestDto } from "@/dtos/auth/change-password.request.dto.js";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const { username, email, password } = req.body as RegisterRequestDto;
    if (!username || !email || !password) {
      return res.status(400).json({
        sucess: false,
        error: "Thông tin đăng ký không hợp lệ",
      });
    }

    const result = await registerService({ username, email, password });

    return res.status(201).json({
      success: true,
      message: "Đăng ký thàng công",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const confirmEmail = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const { otp, email } = req.body as ConfirmEmailRequestDto;
    if (!otp || !email) {
      return res.status(400).json({
        sucess: false,
        error: "Thông tin xác nhận không hợp lệ",
      });
    }

    const result = await confirmEmailService({ otp, email });

    return res.status(200).json({
      success: true,
      message: "Xác nhận email thành công",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const resendOTP = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const { email } = req.body as ResendOtpRequestDto;
    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email không hợp lệ",
      });
    }

    const result = await resendOTPService({ email });

    return res.status(200).json({
      success: true,
      message: "Gửi lại mã OTP thành công",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const { email, password } = req.body as LoginRequestDto;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: !email
          ? "Email đăng nhập không hợp lệ"
          : "Mật khẩu đăng nhập không hợp lệ",
        statusCode: 400,
      });
    }

    const result = await loginService({ email, password });

    return res.status(200).json({
      success: true,
      message: "Đăng nhập thành công",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({
        sucess: false,
        error: "Token không hợp lệ",
        statusCode: 400,
      });
    }

    const result = await getProfileService({ userId });

    return res.status(200).json({
      success: true,
      message: "Lấy thông tin user thành công",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({
        sucess: false,
        error: "Token không hợp lệ",
        statusCode: 400,
      });
    }

    const { username, profileImage } = req.body as UpdateProfileRequestDto;
    if (!username) {
      return res.status(400).json({
        success: false,
        error: "Username không được trống",
        statusCode: 400,
      });
    }

    const result = await updateProfileService({
      userId,
      username,
      profileImage,
    });

    return res.status(200).json({
      success: true,
      message: "Cập nhật thông tin user thành công",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({
        sucess: false,
        error: "Token không hợp lệ",
        statusCode: 400,
      });
    }

    const { currentPassword, newPassword } =
      req.body as ChangePasswordRequestDto;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: !currentPassword
          ? "Mật khẩu hiện tại không được trống"
          : "Mật khẩu mới không được trống",
        statusCode: 400,
      });
    }

    await changePasswordService({ userId, currentPassword, newPassword });

    return res.status(200).json({
      success: true,
      message: "Đổi mật khẩu thành công",
    });
  } catch (error) {
    next(error);
  }
};

export const googleLogin = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const { code } = req.body as GoogleLoginRequestDto;
    if (!code) {
      return res.status(400).json({
        success: false,
        error: "Authorization code is required",
      });
    }

    const result = await googleLoginService(code);

    return res.status(200).json({
      success: true,
      message: "Đăng nhập Google thành công",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
