import {
  registerService,
  loginService,
  getProfileService,
  updateProfileService,
  changePasswordService,
} from "../services/authService.js";

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({
        sucess: false,
        error: "Thông tin đăng ký không hợp lệ",
      });
    }

    // Call service to register user
    const result = await registerService({ username, email, password });

    // Return data
    return res.status(201).json({
      success: true,
      message: "Đăng ký thàng công",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: !email
          ? "Email đăng nhập không hợp lệ"
          : "Mật khẩu đăng nhập không hợp lệ",
        statusCode: 400,
      });
    }

    // Call service to login
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

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(400).json({
        sucess: false,
        error: "Token không hợp lệ",
        statusCode: 400,
      });
    }

    // Call service to get profile
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

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(400).json({
        sucess: false,
        error: "Token không hợp lệ",
        statusCode: 400,
      });
    }

    const { username, profileImage } = req.body;
    if (!username || !profileImage) {
      return res.status(400).json({
        success: false,
        error: !username
          ? "Username không được trống"
          : "Profile image không được trống",
        statusCode: 400,
      });
    }

    // Call service to update profile
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

// @desc    Change user password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(400).json({
        sucess: false,
        error: "Token không hợp lệ",
        statusCode: 400,
      });
    }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: !changePassword
          ? "Mật khẩu hiện tại không được trống"
          : "Mật khẩu mới không được trống",
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
