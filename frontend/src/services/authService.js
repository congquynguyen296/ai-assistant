import axiosInstance from "@/utils/axiosInstance.js";
import { API_PATHS } from "@/utils/apiPath.js";

const login = async (email, password) => {
  try {
    const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || "Đăng nhập thất bại";
  }
};

const googleLogin = async (code) => {
  try {
    const response = await axiosInstance.post(API_PATHS.AUTH.GOOGLE_LOGIN, {
      code,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || "Đăng nhập Google thất bại";
  }
};

const register = async (username, email, password) => {
  try {
    const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
      username,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || "Đăng ký thất bại";
  }
};

const getProfile = async () => {
  try {
    const response = await axiosInstance.get(API_PATHS.AUTH.PROFILE);
    return response.data;
  } catch (error) {
    throw error.response?.data || "Lấy thông tin user thất bại";
  }
};

const updateProfile = async (userData) => {
  try {
    const response = await axiosInstance.put(
      API_PATHS.AUTH.UPDATE_PROFILE,
      userData
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || "Cập nhật thông tin user thất bại";
  }
};

const changePassword = async (oldPassword, newPassword) => {
  try {
    const response = await axiosInstance.post(API_PATHS.AUTH.CHANGE_PASSWORD, {
      oldPassword,
      newPassword,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || "Thay đổi mật khẩu thất bại";
  }
};

const authService = {
  login,
  googleLogin,
  register,
  getProfile,
  updateProfile,
  changePassword,
};
export default authService;
