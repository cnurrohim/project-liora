// src/routes/stockLocation.route.ts
import { Hono } from "hono";
import { z } from "zod";
import { db } from "../../db.js";

export const stockLocationsRoute = new Hono();

// Schema Zod untuk validasi
const stockLocationsSchema = z.object({
  code: z.string().min(1, "Code wajib diisi"),
  name: z.string().min(1, "Name wajib diisi"),
  type: z.string().min(1, "Type wajib diisi"), // contoh: warehouse, store_display, front_desk, cold_storage, container
  description: z.string().optional(),
});

// GET /stock-locations - ambil semua lokasi
stockLocationsRoute.get("/", async (c) => {
  const result = await db.query(
    "SELECT * FROM logistics.stock_locations ORDER BY code ASC"
  );
  return c.json({ data: result.rows });
});

// Search by term
stockLocationsRoute.get("/:term/search", async (c) => {
  const term = c.req.param("term");
  const { rows } = await db.query(
    `SELECT id, code, name, type
     FROM logistics.stock_locations
     WHERE code ILIKE $1 OR name ILIKE $1
     ORDER BY code ASC
     LIMIT 20`,
    [`%${term}%`]
  );
  return c.json({ data: rows });
});

stockLocationsRoute.get("/:term/search/:item_id", async (c) => {
  const term = c.req.param("term");
  const item_id = c.req.param("item_id");

  const { rows } = await db.query(
    `
    SELECT l.id, l.code, l.name, sb.qty
    FROM logistics.stock_locations l
    JOIN logistics.stock_balances sb 
      ON sb.location_id = l.id
    WHERE sb.item_id = $2
      AND (l.code ILIKE $1 OR l.name ILIKE $1)
      AND sb.qty > 0
    ORDER BY l.code ASC
    LIMIT 20
    `,
    [`%${term}%`, item_id]
  );

  return c.json({ data: rows });
});

// GET /stock-locations/:id - ambil detail lokasi
stockLocationsRoute.get("/:id", async (c) => {
  const id = c.req.param("id");
  const result = await db.query(
    "SELECT * FROM logistics.stock_locations WHERE id = $1",
    [id]
  );
  const data = result.rows[0];
  if (!data) return c.json({ error: "Location not found" }, 404);
  return c.json({ data });
});

// POST /stock-locations - tambah lokasi baru
stockLocationsRoute.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const parsed = stockLocationsSchema.parse(body);

    const result = await db.query(
      `INSERT INTO logistics.stock_locations (id, code, name, type, description)
       VALUES (gen_random_uuid(), $1, $2, $3, $4)
       RETURNING *`,
      [parsed.code, parsed.name, parsed.type, parsed.description ?? null]
    );
    return c.json({ data: result.rows[0] });
  } catch (err: any) {
    console.error("Insert stock location error:", err);
    if (err instanceof z.ZodError) {
      return c.json({ error: err.flatten() }, 400);
    }
    return c.json({ error: "Gagal menambahkan lokasi" }, 400);
  }
});

// PUT /stock-locations/:id - update lokasi
stockLocationsRoute.put("/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const body = await c.req.json();
    const parsed = stockLocationsSchema.parse(body);

    const result = await db.query(
      `UPDATE logistics.stock_locations
       SET code = $1, name = $2, type = $3, description = $4, updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [parsed.code, parsed.name, parsed.type, parsed.description ?? null, id]
    );
    if (!result.rows.length)
      return c.json({ error: "Location not found" }, 404);
    return c.json({ data: result.rows[0] });
  } catch (err: any) {
    console.error("Update stock location error:", err);
    if (err instanceof z.ZodError) {
      return c.json({ error: err.flatten() }, 400);
    }
    return c.json({ error: "Gagal mengubah lokasi" }, 400);
  }
});

// DELETE /stock-locations/:id - hapus lokasi
stockLocationsRoute.delete("/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const result = await db.query(
      "DELETE FROM logistics.stock_locations WHERE id = $1 RETURNING *",
      [id]
    );
    if (!result.rows.length)
      return c.json({ error: "Location not found" }, 404);
    return c.json({ data: result.rows[0] });
  } catch (err) {
    console.error("Delete stock location error:", err);
    return c.json({ error: "Gagal menghapus lokasi" }, 400);
  }
});
