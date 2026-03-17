import redisClient from "../config/redis.js";

class RedisService {
  constructor() {
    this.defaultTtl = 3600;
    this.refreshTtl = this.normalizeTtl(process.env.REDIS_TTL);
  }

  /**
   * Normalize TTL value (seconds) to a safe positive integer.
   * @param {string|number|undefined|null} ttl
   * @returns {number}
   */
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

  /**
   * Get object from Redis
   * @param {string} key
   * @returns {Promise<any>}
   */
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

  /**
   * Set object in Redis with TTL
   * @param {string} key
   * @param {any} value
   * @param {number|string} timeout in seconds
   */
  async setObject(key, value, timeout) {
    if (value === null || value === undefined) {
      throw new Error("Do not set object: value is null or undefined");
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

  /**
   * Delete object from Redis
   * @param {string} key
   */
  async deleteObject(key) {
    try {
      await redisClient.del(key);
    } catch (e) {
      console.error(`Error deleting object for key ${key}:`, e);
    }
  }

  /**
   * Check if key exists
   * @param {string} key
   * @returns {Promise<boolean>}
   */
  async exists(key) {
    try {
      const count = await redisClient.exists(key);
      return count > 0;
    } catch (e) {
      console.error(`Error checking existence for key ${key}:`, e);
      return false;
    }
  }

  /**
   * Update a specific field in the stored object
   * @param {string} key
   * @param {string} field
   * @param {any} value
   */
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

  /**
   * Get a specific field from the stored object
   * @param {string} key
   * @param {string} field
   * @returns {Promise<any>}
   */
  async getField(key, field) {
    try {
      // Note: The Java implementation used opsForHash().get() which implies a Redis Hash.
      // However, setObject uses opsForValue().set() (JSON string).
      // To be consistent with setObject, we retrieve the JSON and access the field.
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

  /**
   * Get TTL of a key
   * @param {string} key
   * @returns {Promise<number>}
   */
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
