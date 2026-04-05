import redisClient from "../config/redis.js";

class RedisService {
  constructor() {
    this.defaultTtl = 3600;
    this.refreshTtl = this.normalizeTtl(process.env.REDIS_TTL);
  }

  normalizeTtl(ttl) {
    if (ttl === undefined || ttl === null || ttl === "") {
      return this.defaultTtl;
    }

    const parsed = Number.parseInt(ttl, 10);
    if (Number.isNaN(parsed) || parsed <= 0) {
      return this.defaultTtl;
    }

    return parsed;
  }

  isEmptyValue(value) {
    if (value === null || value === undefined) return true;
    if (Array.isArray(value) && value.length === 0) return true;
    if (
      typeof value === "object" &&
      !Array.isArray(value) &&
      Object.keys(value).length === 0
    )
      return true;
    if (typeof value === "string" && value.trim() === "") return true;
    return false;
  }

  async getObject(key) {
    try {
      const json = await redisClient.get(key);
      if (!json) {
        return null;
      }
      return JSON.parse(json);
    } catch (e) {
      console.error(`Error getting object for key ${key}:`, e);
      throw new Error("Do not get object: " + e.message);
    }
  }

  async setObject(key, value, timeout) {
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
      throw new Error(`Failed to cache object in Redis: ${e.message}`);
    }
  }

  async deleteObject(key) {
    try {
      await redisClient.del(key);
    } catch (e) {
      console.error(`Error deleting object for key ${key}:`, e);
    }
  }

  async exists(key) {
    try {
      const count = await redisClient.exists(key);
      return count > 0;
    } catch (e) {
      console.error(`Error checking existence for key ${key}:`, e);
      return false;
    }
  }

  async setField(key, field, value) {
    try {
      let meta = await this.getObject(key);

      if (!meta || typeof meta !== "object") {
        meta = {};
      }

      meta[field] = value;

      await this.setObject(key, meta, this.refreshTtl);
    } catch (e) {
      console.error(`Error setting field ${field} for key ${key}:`, e);
      throw e;
    }
  }

  async getField(key, field) {
    try {
      const obj = await this.getObject(key);
      if (!obj) {
        return null;
      }
      return obj[field];
    } catch (e) {
      console.error(`Error getting field ${field} for key ${key}:`, e);
      throw new Error(`Failed to deserialize field value: ${e.message}`);
    }
  }

  async getTtl(key) {
    try {
      return await redisClient.ttl(key);
    } catch (e) {
      console.error(`Error getting TTL for key ${key}:`, e);
      return -2;
    }
  }
}

export const redisService = new RedisService();
