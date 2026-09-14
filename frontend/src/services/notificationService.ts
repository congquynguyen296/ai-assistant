import axiosInstance from "@/utils/axiosInstance";
import { NotificationItem } from "@/types/models";

export const getNotifications = async () => {
  const response = await axiosInstance.get<{ success: boolean; data: NotificationItem[] }>(
    "/notifications",
  );
  return response.data;
};

export const markAsRead = async (id: string) => {
  const response = await axiosInstance.put<{ success: boolean; data: NotificationItem }>(
    `/notifications/${id}/read`,
  );
  return response.data;
};

export const markAllAsRead = async () => {
  const response = await axiosInstance.put<{ success: boolean; message: string }>(
    "/notifications/mark-all-read",
  );
  return response.data;
};

export const deleteAllRead = async () => {
  const response = await axiosInstance.delete<{ success: boolean; message: string }>(
    "/notifications/delete-all-read",
  );
  return response.data;
};
