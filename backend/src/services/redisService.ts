import redisClient from "@/config/redis.js";

class RedisService {
  defaultTtl: number;
  refreshTtl: number;

  constructor() {
    this.defaultTtl = 3600;
    this.refreshTtl = this.normalizeTtl(process.env.REDIS_TTL);
  }

  normalizeTtl(ttl?: string | number | null): number {
    if (ttl === undefined || ttl === null || ttl === "") {
      return this.defaultTtl;
    }

    const parsed = Number.parseInt(String(ttl), 10);
    if (Number.isNaN(parsed) || parsed <= 0) {
      return this.defaultTtl;
    }

    return parsed;
  }

  isEmptyValue(value: unknown): boolean {
    if (value === null || value === undefined) return true;
    if (Array.isArray(value) && value.length === 0) return true;
    if (
      typeof value === "object" &&
      !Array.isArray(value) &&
      Object.keys(value as Record<string, unknown>).length === 0
    )
      return true;
    if (typeof value === "string" && value.trim() === "") return true;
    return false;
  }

  async getObject<T>(key: string): Promise<T | null> {
    try {
      const json = await redisClient.get(key);
      if (!json) {
        return null;
      }
      return JSON.parse(json) as T;
    } catch (e) {
      console.error(`Error getting object for key ${key}:`, e);
      throw new Error("Do not get object: " + (e as Error).message);
    }
  }

  async setObject<T>(key: string, value: T, timeout?: number): Promise<void> {
    if (this.isEmptyValue(value)) {
      console.warn(`setObject skipped for key "${key}": value is empty or null.`);
      return;
    }

    try {
      const json = JSON.stringify(value);
      const ttl = this.normalizeTtl(timeout);
      await redisClient.setEx(key, ttl, json);
    } catch (e) {
      console.error(`Error setting object for key ${key}:`, e);
      throw new Error(`Failed to cache object in Redis: ${(e as Error).message}`);
    }
  }

  async deleteObject(key: string): Promise<void> {
    try {
      await redisClient.del(key);
    } catch (e) {
      console.error(`Error deleting object for key ${key}:`, e);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const count = await redisClient.exists(key);
      return count > 0;
    } catch (e) {
      console.error(`Error checking existence for key ${key}:`, e);
      return false;
    }
  }

  async setField<T extends Record<string, unknown>>(
    key: string,
    field: keyof T,
    value: T[keyof T],
  ): Promise<void> {
    try {
      let meta = await this.getObject<T>(key);

      if (!meta || typeof meta !== "object") {
        meta = {} as T;
      }

      (meta as T)[field] = value;

      await this.setObject(key, meta, this.refreshTtl);
    } catch (e) {
      console.error(`Error setting field ${String(field)} for key ${key}:`, e);
      throw e;
    }
  }

  async getField<T extends Record<string, unknown>>(
    key: string,
    field: keyof T,
  ): Promise<T[keyof T] | null> {
    try {
      const obj = await this.getObject<T>(key);
      if (!obj) {
        return null;
      }
      return obj[field];
    } catch (e) {
      console.error(`Error getting field ${String(field)} for key ${key}:`, e);
      throw new Error(`Failed to deserialize field value: ${(e as Error).message}`);
    }
  }

  async getTtl(key: string): Promise<number> {
    try {
      return await redisClient.ttl(key);
    } catch (e) {
      console.error(`Error getting TTL for key ${key}:`, e);
      return -2;
    }
  }
}

export const redisService = new RedisService();
