import Redis from "ioredis";
import env from "./env";

const redisUrl = env.REDIS_URL;

if (!redisUrl) {
  console.warn("REDIS_URL is not defined in environment variables.");
}

// Parse URL to detect TLS requirement (rediss:// protocol)
const isTLS = redisUrl?.startsWith("rediss://");

// Create Redis client with TLS support for cloud providers
const createRedisClient = () => {
  if (!redisUrl) {
    throw new Error("REDIS_URL is required");
  }

  return new Redis(redisUrl, {
    tls: isTLS
      ? {
          rejectUnauthorized: false, // Required for most cloud Redis providers
        }
      : undefined,
    maxRetriesPerRequest: 3,
    lazyConnect: false,
  });
};

// Main Redis client for general operations
export const redis = createRedisClient();

// Separate clients for pub/sub (required by Redis)
export const publisher = createRedisClient();
export const subscriber = createRedisClient();

// Pub/Sub channel names
export const WEBHOOK_CHANNEL_PREFIX = "webhook:events:";

export default redis;
