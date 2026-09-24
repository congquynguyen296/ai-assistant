import type { AuthRequest } from "@/dtos/common/request.dto.js";

export const getUserIdFromReq = (req: AuthRequest): string => {
  if (!req.user || !req.user.id) {
    throw new Error("User ID not found in request");
  }
  return req.user.id;
};
