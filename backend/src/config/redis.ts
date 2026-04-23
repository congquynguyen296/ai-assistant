import { createClient, type RedisClientOptions } from "redis";

const redisConfig: RedisClientOptions = process.env.REDIS_URL
  ? { url: process.env.REDIS_URL }
  : {
      socket: {
        host: process.env.REDIS_HOST || "localhost",
        port: process.env.REDIS_PORT
          ? Number.parseInt(process.env.REDIS_PORT, 10)
          : 6379,
      },
    };

const redisClient = createClient(redisConfig);

redisClient.on("error", (err) => console.log("Redis Client Error", err));
redisClient.on("connect", () => {
  const socket = redisClient.options?.socket;
  const host =
    socket && typeof socket === "object" && "host" in socket
      ? String(socket.host)
      : "unknown";
  const port =
    socket && typeof socket === "object" && "port" in socket
      ? String(socket.port)
      : "unknown";
  console.log(`Redis Client Connected: ${host}:${port}`);
});

export const connectRedis = async (): Promise<void> => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
};

export default redisClient;
