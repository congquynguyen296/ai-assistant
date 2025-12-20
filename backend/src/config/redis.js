import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

const redisConfig = process.env.REDIS_URL
  ? { url: process.env.REDIS_URL }
  : {
      socket: {
        host: process.env.REDIS_HOST || "localhost",
        port: process.env.REDIS_PORT || 6379,
      },
    };

const redisClient = createClient(redisConfig);

redisClient.on("error", (err) => console.log("Redis Client Error", err));
redisClient.on("connect", () =>
  console.log(
    `Redis Client Connected: ${redisClient.options.socket.host}:${redisClient.options.socket.port}`
  )
);

export const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
};

export default redisClient;
