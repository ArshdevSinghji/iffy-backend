import { Redis } from "ioredis";

let redis: Redis | null = null;

export const getRedis = (): Redis => {
  if (redis) return redis;

  redis = new Redis({
    host: process.env.REDIS_HOST ?? "localhost",
    port: Number(process.env.REDIS_PORT ?? 6379),
    password: process.env.REDIS_PASSWORD,
    maxRetriesPerRequest: null, // required by BullMQ
    enableReadyCheck: false, // required by BullMQ
  });

  redis.on("connect", () => console.log("[Redis] Connected"));
  redis.on("error", (err) => console.error("[Redis] Error:", err));

  return redis;
};

export const disconnectRedis = async (): Promise<void> => {
  if (redis) {
    await redis.quit();
    redis = null;
    console.log("[Redis] Disconnected");
  }
};
