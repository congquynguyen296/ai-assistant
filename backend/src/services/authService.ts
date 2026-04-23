import { AppError } from "@/middlewares/errorHandle.js";
import User from "@/models/User.js";
import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import { getGoogleClient } from "@/config/googleConfig.js";
import { redisService } from "@/services/redisService.js";
import { sendOTP, sendWelcomeEmail } from "@/services/mailService.js";
import type {
  LoginResponseDto,
} from "@/dtos/auth/login.response.dto.js";
import type {
  RegisterResponseDto,
  ConfirmEmailResponseDto,
} from "@/dtos/auth/register.response.dto.js";
import type { ProfileResponseDto } from "@/dtos/auth/profile.response.dto.js";

interface JwtTokenPayload {
  id: string;
}

interface RegisterInput {
  username: string;
  email: string;
  password: string;
}

interface ConfirmEmailInput {
  otp: string;
  email: string;
}

interface ResendOtpInput {
  email: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface UpdateProfileInput {
  userId: string;
  username: string;
  profileImage?: string | null;
}

interface ChangePasswordInput {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

const generateToken = (payload: JwtTokenPayload): string => {
  const secret = process.env.JWT_SECRET as Secret;
  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRE || "7d") as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, secret, options);
};

export const registerService = async (
  input: RegisterInput,
): Promise<RegisterResponseDto> => {
  const { username, email, password } = input;

  const existedUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existedUser) {
    throw new AppError(
      existedUser.email === email ? "Email đã tồn tại" : "Username đã tồn tại",
      400,
    );
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const userData = { username, email, password, otp };
  await redisService.setObject(`register_otp:${email}`, userData, 300);

  await sendOTP(email, otp);

  return {
    message: "Mã OTP đã được gửi đến email của bạn",
    email,
  };
};

export const confirmEmailService = async (
  input: ConfirmEmailInput,
): Promise<ConfirmEmailResponseDto> => {
  const { otp, email } = input;
  const parsedData = await redisService.getObject<RegisterInput & { otp: string }>(
    `register_otp:${email}`,
  );

  if (!parsedData) {
    throw new AppError("Mã OTP đã hết hạn hoặc không tồn tại", 400);
  }

  if (parsedData.otp !== otp) {
    throw new AppError("Mã OTP không chính xác", 400);
  }

  const newUser = await User.create({
    username: parsedData.username,
    email: parsedData.email,
    password: parsedData.password,
  });

  await redisService.deleteObject(`register_otp:${email}`);

  await sendWelcomeEmail(email, parsedData.username);

  const token = generateToken({ id: newUser._id.toString() });

  return {
    user: {
      id: newUser._id.toString(),
      username: newUser.username,
      email: newUser.email,
    },
    token,
  };
};

export const resendOTPService = async (
  input: ResendOtpInput,
): Promise<{ message: string }> => {
  const { email } = input;
  const parsedData = await redisService.getObject<RegisterInput & { otp: string }>(
    `register_otp:${email}`,
  );

  if (!parsedData) {
    throw new AppError("Phiên đăng ký đã hết hạn, vui lòng đăng ký lại", 400);
  }

  const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
  parsedData.otp = newOtp;
  await redisService.setObject(`register_otp:${email}`, parsedData, 300);

  await sendOTP(email, newOtp);

  return {
    message: "Mã OTP mới đã được gửi",
  };
};

export const loginService = async (
  input: LoginInput,
): Promise<LoginResponseDto> => {
  const { email, password } = input;

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new AppError("User không tồn tại", 404);
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new AppError("Mật khẩu không đúng", 401);
  }

  const token = generateToken({ id: user._id.toString() });

  return {
    user: {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      profileImage: user.profileImage,
    },
    token,
  };
};

export const getProfileService = async (input: {
  userId: string;
}): Promise<ProfileResponseDto> => {
  const user = await User.findById(input.userId).select("-password");

  if (!user) {
    throw new AppError("User không tồn tại", 404);
  }

  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    profileImage: user.profileImage,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

export const updateProfileService = async (
  input: UpdateProfileInput,
): Promise<ProfileResponseDto> => {
  const { userId, username, profileImage } = input;
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User không tồn tại", 404);
  }

  user.username = username || user.username;
  if (profileImage !== undefined) {
    user.profileImage = profileImage || null;
  }

  await user.save();

  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    profileImage: user.profileImage,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

export const changePasswordService = async (
  input: ChangePasswordInput,
): Promise<void> => {
  const { userId, currentPassword, newPassword } = input;
  const user = await User.findById(userId).select("+password");
  if (!user) {
    throw new AppError("User không tồn tại", 404);
  }

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    throw new AppError("Mật khẩu hiện tại không đúng", 401);
  }

  user.password = newPassword;
  await user.save();

  console.log("Password updated successfully");
};

export const googleLoginService = async (
  code: string,
): Promise<LoginResponseDto> => {
  try {
    const oAuth2Client = getGoogleClient();
    const { tokens } = await oAuth2Client.getToken({
      code,
      redirect_uri: process.env.GOOGLE_OAUTH_REDIRECT,
    });
    oAuth2Client.setCredentials(tokens);

    const ticket = await oAuth2Client.verifyIdToken({
      idToken: tokens.id_token as string,
      audience: process.env.GOOGLE_OAUTH_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload) {
      throw new AppError("Google Login Failed: Empty payload", 400);
    }

    const { sub: googleId, email, name, picture } = payload;

    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        user.profileImage = picture || null;
        await user.save();
      }
    } else {
      let username = name || (email ? email.split("@")[0] : "user");

      let existingUsername = await User.findOne({ username });
      while (existingUsername) {
        username = `${username}${Math.floor(Math.random() * 1000)}`;
        existingUsername = await User.findOne({ username });
      }

      const defaultPassword = Math.random().toString(36).slice(-8);
      if (email) {
        await sendWelcomeEmail(email, username, defaultPassword);
      }

      user = await User.create({
        username,
        email,
        googleId,
        profileImage: picture,
        password: defaultPassword,
      });
    }

    const token = generateToken({ id: user._id.toString() });

    return {
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
      },
      token,
    };
  } catch (error) {
    console.error("Google Login Error:", error);
    throw new AppError("Google Login Failed: " + (error as Error).message, 400);
  }
};
