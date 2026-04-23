import type { Response, NextFunction } from "express";
import { getDashboardService } from "@/services/progressService.js";
import { getUserIdFromReq } from "@/utils/authUtil.js";
import type { AuthRequest } from "@/types/request.js";

export const getDashboard = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const userId = getUserIdFromReq(req);

    const result = await getDashboardService({ userId });

    return res.status(200).json({
      success: true,
      message: "Lấy dashboard thành công",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
