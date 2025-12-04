import { getDashboardService } from "../services/processService.js";
import { getUserIdFromReq } from "../utils/authUtil.js";

export const getDashboard = async (req, res, next) => {
  try {
    const userId = getUserIdFromReq(req);

    const result = getDashboardService({ userId });

    return res.status(200).json({
      success: true,
      message: "Lấy dashboard thành công",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
