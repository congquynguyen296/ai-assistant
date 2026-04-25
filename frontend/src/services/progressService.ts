import axiosInstance from "@/utils/axiosInstance";
import { API_PATHS } from "@/utils/apiPath";
import type { DashboardResponse } from "@/types/api.types";

const getDashboard = async (): Promise<DashboardResponse> => {
  try {
    const respone = await axiosInstance.get<DashboardResponse>(
      API_PATHS.PROGRESS.GET_DASHBOARD
    );
    return respone.data;
  } catch (error) {
    const err = error as { respone?: { data?: unknown } };
    throw err.respone?.data || "Lấy thông tin dashboard thất bại";
  }
};

const progressService = { getDashboard };
export default progressService;
