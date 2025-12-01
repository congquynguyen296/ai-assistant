import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protect = async (req, res, next) => {
  let token;

  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      const err = new Error("Không có token, truy cập bị từ chối");
      err.statusCode = 401;
      return next(err);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      const err = new Error("Người dùng không tồn tại");
      err.statusCode = 401;
      return next(err);
    }

    req.user = user;
    next();
  } catch (error) {
    console.log(`🚫 Lỗi middleware: ${error.message}`);
    return next(error);
  }
};

export default protect;
