import { createClient } from "redis";

export const redis = createClient({
  url: "redis://127.0.0.1:6379", // default
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
