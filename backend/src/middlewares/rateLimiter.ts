import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import redisClient from "../config/redis.js";
import type { Request, Response } from "express";

// Create a generic Redis store for rate limiters
const getRedisStore = (prefix: string) => {
  return new RedisStore({
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
    prefix: prefix,
  });
};

export const authLimiter = rateLimit({
  store: getRedisStore("rl:auth:"),
  windowMs: 15 * 60 * 1000, // 15p
  max: 5, // Tối đa 5 requests mỗi 15p trên mỗi IP
  message: {
    success: false,
    message: "Bạn đã thử quá nhiều lần. Vui lòng thử lại sau 15 phút.",
  },
  standardHeaders: true, // Trả về `RateLimit-*` headers
  legacyHeaders: false, // Tắt `X-RateLimit-*` headers cũ
  keyGenerator: (req: Request) => {
    const rawIp = req.ip || req.socket.remoteAddress || "unknown";
    return ipKeyGenerator(rawIp);
  },
});

export const otpLimiter = rateLimit({
  store: getRedisStore("rl:otp:"),
  windowMs: 15 * 60 * 1000,
  max: 2,
  message: {
    success: false,
    message: "Bạn đã yêu cầu mã OTP quá nhiều lần. Vui lòng thử lại sau 15 phút.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const rawIp = req.ip || req.socket.remoteAddress || "unknown";
    return ipKeyGenerator(rawIp);
  },
});

export const apiLimiter = rateLimit({
  store: getRedisStore("rl:api:"),
  windowMs: 60 * 60 * 1000, // 1 giờ
  max: 100,
  message: {
    success: false,
    message: "Hệ thống đang quá tải hoặc bạn đã vượt quá giới hạn. Vui lòng thử lại sau.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    if (req.user && req.user._id) {
      return req.user._id.toString();
    }
    const rawIp = req.ip || req.socket.remoteAddress || "unknown";
    return ipKeyGenerator(rawIp);
  },
});
