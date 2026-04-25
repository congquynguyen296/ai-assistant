import axiosInstance from "@/utils/axiosInstance";
import { API_PATHS } from "@/utils/apiPath";
import type {
  AuthResponse,
  ProfileResponse,
} from "@/types/api.types";
import type { AuthProfileUpdate, AuthSession } from "@/types/auth.types";

const login = async (
  email: string,
  password: string
): Promise<AuthResponse | AuthSession> => {
  try {
    const response = await axiosInstance.post<AuthResponse>(
      API_PATHS.AUTH.LOGIN,
      {
        email,
        password,
      }
    );
    return response.data;
  } catch (error) {
    const err = error as { response?: { data?: unknown } };
    throw err.response?.data || "Đăng nhập thất bại";
  }
};

const googleLogin = async (code: string): Promise<AuthResponse | AuthSession> => {
  try {
    const response = await axiosInstance.post<AuthResponse>(
      API_PATHS.AUTH.GOOGLE_LOGIN,
      {
        code,
      }
    );
    return response.data;
  } catch (error) {
    const err = error as { response?: { data?: unknown } };
    throw err.response?.data || "Đăng nhập Google thất bại";
  }
};

const register = async (
  username: string,
  email: string,
  password: string
): Promise<AuthResponse | AuthSession> => {
  try {
    const response = await axiosInstance.post<AuthResponse>(
      API_PATHS.AUTH.REGISTER,
      {
        username,
        email,
        password,
      }
    );
    return response.data;
  } catch (error) {
    const err = error as { response?: { data?: unknown } };
    throw err.response?.data || "Đăng ký thất bại";
  }
};

const verifyOTP = async (
  email: string,
  otp: string
): Promise<AuthResponse | AuthSession> => {
  try {
    const response = await axiosInstance.post<AuthResponse>(
      API_PATHS.AUTH.CONFIRM_EMAIL,
      {
        email,
        otp,
      }
    );
    return response.data;
  } catch (error) {
    const err = error as { response?: { data?: unknown } };
    throw err.response?.data || "Xác thực OTP thất bại";
  }
};

const resendOTP = async (email: string): Promise<AuthResponse> => {
  try {
    const response = await axiosInstance.post<AuthResponse>(
      API_PATHS.AUTH.RESEND_OTP,
      {
        email,
      }
    );
    return response.data;
  } catch (error) {
    const err = error as { response?: { data?: unknown } };
    throw err.response?.data || "Gửi lại OTP thất bại";
  }
};

const getProfile = async (): Promise<ProfileResponse> => {
  try {
    const response = await axiosInstance.get<ProfileResponse>(
      API_PATHS.AUTH.PROFILE
    );
    return response.data;
  } catch (error) {
    const err = error as { response?: { data?: unknown } };
    throw err.response?.data || "Lấy thông tin user thất bại";
  }
};

const updateProfile = async (
  userData: AuthProfileUpdate
): Promise<ProfileResponse> => {
  try {
    const response = await axiosInstance.put<ProfileResponse>(
      API_PATHS.AUTH.UPDATE_PROFILE,
      userData
    );
    return response.data;
  } catch (error) {
    const err = error as { response?: { data?: unknown } };
    throw err.response?.data || "Cập nhật thông tin user thất bại";
  }
};

const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<AuthResponse> => {
  try {
    const response = await axiosInstance.put<AuthResponse>(
      API_PATHS.AUTH.CHANGE_PASSWORD,
      {
        currentPassword,
        newPassword,
      }
    );
    return response.data;
  } catch (error) {
    const err = error as { response?: { data?: unknown } };
    throw err.response?.data || "Thay đổi mật khẩu thất bại";
  }
};

const authService = {
  login,
  googleLogin,
  register,
  verifyOTP,
  resendOTP,
  getProfile,
  updateProfile,
  changePassword,
};
export default authService;
