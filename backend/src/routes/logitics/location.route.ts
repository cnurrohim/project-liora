// src/routes/location.route.ts
import { Hono } from "hono";
import { z } from "zod";
import { db } from "../../db.js";

export const locationRoute = new Hono();

// Schema Zod untuk validasi
const locationSchema = z.object({
  code: z.string().min(1, "Code wajib diisi"),
  description: z.string().optional(),
});

// GET /locations - ambil semua lokasi
locationRoute.get("/", async (c) => {
  const result = await db.query(
    "SELECT * FROM logistics.locations ORDER BY code ASC"
  );
  return c.json({ data: result.rows });
});

// GET /locations/:id - ambil detail lokasi
locationRoute.get("/:id", async (c) => {
  const id = c.req.param("id");
  const result = await db.query(
    "SELECT * FROM logistics.locations WHERE id = $1",
    [id]
  );
  const data = result.rows[0];
  if (!data) return c.json({ error: "Location not found" }, 404);
  return c.json({ data });
});

// POST /locations - tambah lokasi baru
locationRoute.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const parsed = locationSchema.parse(body); // validasi zod

    const result = await db.query(
      `INSERT INTO logistics.locations (id, code, description)
       VALUES (gen_random_uuid(), $1, $2)
       RETURNING *`,
      [parsed.code, parsed.description ?? null]
    );
    return c.json({ data: result.rows[0] });
  } catch (err: any) {
    console.error("Insert location error:", err);
    if (err instanceof z.ZodError) {
      return c.json({ error: err.flatten }, 400);
    }
    return c.json({ error: "Gagal menambahkan lokasi" }, 400);
  }
});

// PUT /locations/:id - update lokasi
locationRoute.put("/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const body = await c.req.json();
    const parsed = locationSchema.parse(body); // validasi zod

    const result = await db.query(
      `UPDATE logistics.locations
       SET code = $1, description = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [parsed.code, parsed.description ?? null, id]
    );
    if (!result.rows.length)
      return c.json({ error: "Location not found" }, 404);
    return c.json({ data: result.rows[0] });
  } catch (err: any) {
    console.error("Update location error:", err);
    if (err instanceof z.ZodError) {
      return c.json({ error: err.flatten }, 400);
    }
    return c.json({ error: "Gagal mengubah lokasi" }, 400);
  }
});

// DELETE /locations/:id - hapus lokasi
locationRoute.delete("/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const result = await db.query(
      "DELETE FROM logistics.locations WHERE id = $1 RETURNING *",
      [id]
    );
    if (!result.rows.length)
      return c.json({ error: "Location not found" }, 404);
    return c.json({ data: result.rows[0] });
  } catch (err) {
    console.error("Delete location error:", err);
    return c.json({ error: "Gagal menghapus lokasi" }, 400);
  }
});
