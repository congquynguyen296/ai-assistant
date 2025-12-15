import { AppError } from "../middlewares/errorHandle.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { getGoogleClient } from "../config/googleConfig.js";

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

export const registerService = async ({ username, email, password }) => {
  // Check if user already exists
  const existedUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existedUser) {
    throw new AppError(
      existedUser.email === email ? "Email đã tồn tại" : "Username đã tồn tại",
      400
    );
  }

  // Create new user
  const newUser = await User.create({ username, email, password });

  // Gererate token
  const token = generateToken({ id: newUser._id });

  return {
    user: {
      id: newUser._id,
      username: newUser.username,
      email: newUser.email,
    },
    token,
  };
};

export const loginService = async ({ email, password }) => {
  // Find user by email
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new AppError("User không tồn tại", 404);
  }

  // Check password
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new AppError("Mật khẩu không đúng", 401);
  }

  // Genrate token
  const token = generateToken({ id: user._id });

  return {
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      profileImage: user.profileImage,
    },
    token,
  };
};

export const getProfileService = async ({ userId }) => {
  const user = await User.findById(userId).select("-password");

  if (!user) {
    throw new AppError("User không tồn tại", 404);
  }

  return {
    id: user._id,
    username: user.username,
    email: user.email,
    profileImage: user.profileImage,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

export const updateProfileService = async ({
  userId,
  username,
  profileImage,
}) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User không tồn tại", 404);
  }

  // Update fields
  user.username = username || user.username;
  user.profileImage = profileImage || user.profileImage;

  await user.save();

  return {
    id: user._id,
    username: user.username,
    email: user.email,
    profileImage: user.profileImage,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

export const changePasswordService = async ({
  userId,
  currentPassword,
  newPassword,
}) => {
  const user = await User.findById(userId).select("+password");
  if (!user) {
    throw new AppError("User không tồn tại", 404);
  }

  // Check match password
  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    throw new AppError("Mật khẩu hiện tại không đúng", 401);
  }

  // Update new password
  user.password = newPassword;
  await user.save();

  console.log("Password updated successfully");
};

export const googleLoginService = async (code) => {
  try {
    const oAuth2Client = getGoogleClient();
    const { tokens } = await oAuth2Client.getToken({
      code,
      redirect_uri: process.env.GOOGLE_OAUTH_REDIRECT,
    });
    oAuth2Client.setCredentials(tokens);

    const ticket = await oAuth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_OAUTH_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    const { sub: googleId, email, name, picture } = payload;

    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    } else {
      let username = name || email.split("@")[0];

      // Ensure username is unique
      let existingUsername = await User.findOne({ username });
      while (existingUsername) {
        username = `${username}${Math.floor(Math.random() * 1000)}`;
        existingUsername = await User.findOne({ username });
      }

      user = await User.create({
        username,
        email,
        googleId,
        profileImage: picture,
      });
    }

    const token = generateToken({ id: user._id });

    return {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
      },
      token,
    };
  } catch (error) {
    console.error("Google Login Error:", error);
    throw new AppError("Google Login Failed: " + error.message, 400);
  }
};
