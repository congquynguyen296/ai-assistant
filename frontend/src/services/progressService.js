import axiosInstance from "@/utils/axiosInstance.js";
import { API_PATHS } from "@/utils/apiPath.js";

const getDashboard = async () => {
  try {
    const respone = await axiosInstance.get(API_PATHS.PROGRESS.GET_DASHBOARD);
    return respone.data;
  } catch (error) {
    throw error.respone?.data || "Lấy thông tin dashboard thất bại";
  }
};

const progressService = { getDashboard };
export default progressService;
