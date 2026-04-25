import axios, { type InternalAxiosRequestConfig } from "axios";
import { BASE_URL } from "@/utils/apiPath";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,   // 30s
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = localStorage.getItem("token");
    if (accessToken) {
      if (config.headers) {
        config.headers.set("Authorization", `Bearer ${accessToken}`);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Có thể xử lý trường hợp request bị từ chối do token hết hạn ở đây
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data || error.message);
    if (error.response) {
      if (error.response.status === 401 && window.location.pathname !== "/login") {
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else if (error.response.status === 500) {
        console.error(`Lỗi hệ thống: ${error.response.data.message}`);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
