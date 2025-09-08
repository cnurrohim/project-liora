import { createClient } from "redis";

export const redis = createClient({
  url: process.env.REDIS_URL,
});

redis.on("error", (err) => {
  console.error("Redis Client Error", err);
});

await redis.connect();

export async function clearRedisCache() {
  const keys = await redis.keys("menus:*");
  if (keys.length > 0) {
    await redis.del(keys);
  }
}
