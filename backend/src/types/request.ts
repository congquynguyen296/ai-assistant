import type { Request } from "express";
import type { UserDocument } from "@/types/entity.js";

export interface AuthRequest extends Request {
  user?: UserDocument;
}
