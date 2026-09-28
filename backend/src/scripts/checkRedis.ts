import { createClient } from "redis";

const checkRedisRateLimits = async () => {
  try {
    const redisUrl = process.env.REDIS_URL;
    const redisHost = process.env.REDIS_HOST || "localhost";
    const redisPort = process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379;

    const client = createClient({
      url: redisUrl,
      socket: {
        host: redisHost,
        port: redisPort,
      },
    });

    client.on("error", (err) => {
      console.error("Redis Client Error", err);
    });

    console.log("Connecting to Redis...");
    await client.connect();
    console.log("Connected successfully.");

    console.log("Checking Rate Limiter keys...");
    const keys = await client.keys("rl:*");
    
    if (keys.length === 0) {
      console.log("No Rate Limiter keys found in Redis.");
    } else {
      console.log(`Found ${keys.length} keys:`);
      for (const key of keys) {
        const value = await client.get(key);
        const ttl = await client.ttl(key);
        console.log(`- Key: ${key} | Requests: ${value} | TTL: ${ttl}s`);
      }
    }

    console.log("Check completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error during Redis check:", error);
    process.exit(1);
  }
};

checkRedisRateLimits();
