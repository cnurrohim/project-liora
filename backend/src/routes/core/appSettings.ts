import { Hono } from "hono";
import { v4 as uuidv4 } from "uuid";
import * as fs from "fs";
import { writeFile } from "fs/promises";
import path from "path";
import { db } from "../../db.js";

export const appSettingsRoute = new Hono();

// GET current app settings
appSettingsRoute.get("/", async (c) => {
  const res = await db.query("SELECT * FROM app_settings LIMIT 1");
  return c.json(res.rows[0] || {});
});

// PUT update settings (nama dan logo)
appSettingsRoute.put("/", async (c) => {
  const body = await c.req.parseBody(); // gunakan parseBody

  const name = body.app_name as string;
  const file = body.app_logo as File | undefined;

  let filename: string | undefined;

  if (file) {
    const ext = path.extname(file.name);
    const allowed = [".png", ".svg"];
    if (!allowed.includes(ext)) {
      return c.json({ error: "Only PNG or SVG allowed" }, 400);
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");

    // Pastikan folder ada
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    filename = `logo_${uuidv4()}${ext}`;
    const buffer = await file.arrayBuffer();
    await writeFile(`./public/uploads/${filename}`, Buffer.from(buffer));
  }

  // Jika belum ada settings → insert, jika ada → update
  const existing = await db.query("SELECT id FROM app_settings LIMIT 1");

  if (existing.rowCount) {
    const updateQuery = `
      UPDATE app_settings SET
        app_name = $1,
        app_logo = COALESCE($2, app_logo),
        updated_at = NOW()
      WHERE id = $3
    `;
    await db.query(updateQuery, [name, filename, existing.rows[0].id]);
  } else {
    await db.query(
      "INSERT INTO app_settings (app_name, app_logo) VALUES ($1, $2)",
      [name, filename]
    );
  }

  return c.json({ success: true, name: name, filename: filename });
});
