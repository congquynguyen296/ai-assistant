import jwt, { type JwtPayload } from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import User from "@/models/User.js";
import type { UserDocument } from "@/types/entity.js";

interface AuthTokenPayload extends JwtPayload {
  id: string;
}

const protect = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  let token: string | undefined;

  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token as string;
    }

    if (!token) {
      const err = new Error("Không có token, truy cập bị từ chối") as Error & {
        statusCode?: number;
      };
      err.statusCode = 401;
      return next(err);
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as AuthTokenPayload;

    const user = (await User.findById(decoded.id).select(
      "-password",
    )) as UserDocument | null;
    if (!user) {
      const err = new Error("Người dùng không tồn tại") as Error & {
        statusCode?: number;
      };
      err.statusCode = 401;
      return next(err);
    }

    req.user = user;
    next();
  } catch (error) {
    console.log(`🚫 Lỗi middleware: ${(error as Error).message}`);
    return next(error as Error);
  }
};

export default protect;
