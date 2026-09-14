import { type Request, type Response, type NextFunction } from "express";
import Notification from "@/models/Notification.js";
import { AppError } from "@/middlewares/errorHandle.js";

export const getNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Không có quyền truy cập", 401);

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Không có quyền truy cập", 401);

    const { id } = req.params;
    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { isRead: true },
      { new: true },
    );

    if (!notification) {
      throw new AppError("Không tìm thấy thông báo", 404);
    }

    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Không có quyền truy cập", 401);

    await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true },
    );

    res.status(200).json({ success: true, message: "Đã đánh dấu tất cả là đã đọc" });
  } catch (error) {
    next(error);
  }
};

export const deleteAllRead = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Không có quyền truy cập", 401);

    await Notification.deleteMany({ userId, isRead: true });

    res.status(200).json({ success: true, message: "Đã xóa tất cả thông báo đã đọc" });
  } catch (error) {
    next(error);
  }
};
