// src/server.ts
import { serve } from "@hono/node-server";
import { app } from "./app.js";
import "dotenv/config"; // kalau pakai dotenv
import { syncPermissions } from "./utils/syncPermissions.js";

export async function startServer() {
  const port = process.env.PORT ? Number(process.env.PORT) : 4000;

  try {
    await syncPermissions();
    // console.log(await bcrypt.hash("123", 10));
    console.log("✅ Permission sync berhasil");
  } catch (error) {
    console.error("❌ Error saat sync permissions:", error);
  }

  console.log(`🚀 Server running at http://localhost:${port}`);
  console.log("DB URL:", process.env.DATABASE_URL);

  serve({ fetch: app.fetch, port });
}
