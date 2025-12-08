import { Hono } from "hono";
import { db } from "../../db.js";
import { z } from "zod";

export const itemRoute = new Hono();

// Schema Zod untuk validasi
const itemSchema = z.object({
  sku: z.string().min(1, "SKU is mandatory"),
  name: z.string().min(1, "Inventory item name is mandatory"),
  min_stock: z
    .number()
    .int()
    .min(0, "Inventory item minimum stock >= 0")
    .optional(),
  location_id: z.uuid().optional(),
  supplier_id: z.uuid().optional(),
});

// GET /items - ambil semua barang
itemRoute.get("/", async (c) => {
  const result = await db.query(
    `SELECT i.*
     FROM inventory.items i
     WHERE i.deleted_at IS NULL
     ORDER BY i.sku ASC`
  );
  return c.json({ data: result.rows });
});

// GET /items/:id - ambil detail barang
itemRoute.get("/:id", async (c) => {
  const id = c.req.param("id");
  const result = await db.query(
    `SELECT i.*
     FROM inventory.items i
     WHERE i.id = $1 AND i.deleted_at IS NULL`,
    [id]
  );
  const data = result.rows[0];
  if (!data) return c.json({ error: "Item not found" }, 404);
  return c.json({ data });
});

// Search item di lokasi tertentu
itemRoute.get("/:term/search/:location_id", async (c) => {
  const term = c.req.param("term");
  const location_id = c.req.param("location_id");
  const { rows } = await db.query(
    `SELECT 
      i.id,
      i.sku,
      i.name,
      COALESCE(sb.qty, 0) AS qty
    FROM inventory.items i
    LEFT JOIN inventory.stock_balances sb 
      ON i.id = sb.item_id AND sb.location_id = $2
    WHERE (i.name ILIKE $1 OR i.sku ILIKE $1)
      AND i.deleted_at IS NULL
    ORDER BY i.sku DESC
    LIMIT 20`,
    [`%${term}%`, location_id]
  );
  return c.json({ data: rows });
});

// Search item global
itemRoute.get("/:term/search", async (c) => {
  const term = c.req.param("term");
  const { rows } = await db.query(
    `SELECT i.id, i.sku, i.name
     FROM inventory.items i
     WHERE (i.name ILIKE $1 OR i.sku ILIKE $1)
       AND i.deleted_at IS NULL
     ORDER BY i.sku DESC
     LIMIT 20`,
    [`%${term}%`]
  );
  return c.json({ data: rows });
});

// POST /items - tambah barang baru
itemRoute.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const parsed = itemSchema.parse(body);

    const result = await db.query(
      `INSERT INTO inventory.items (id, sku, name, min_stock)
       VALUES (gen_random_uuid(), $1, $2, $3)
       RETURNING *`,
      [parsed.sku, parsed.name, parsed.min_stock ?? 0]
    );
    return c.json({ data: result.rows[0] });
  } catch (err: any) {
    console.error("Insert item error:", err);
    if (err instanceof z.ZodError) {
      return c.json({ error: err.flatten }, 400);
    }
    return c.json({ error: "Failed to add new inventory item" }, 400);
  }
});

// PUT /items/:id - update barang
itemRoute.put("/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const body = await c.req.json();
    const parsed = itemSchema.parse(body);

    const result = await db.query(
      `UPDATE inventory.items
       SET sku = $1, name = $2, min_stock = $3, updated_at = NOW()
       WHERE id = $4 AND deleted_at IS NULL
       RETURNING *`,
      [parsed.sku, parsed.name, parsed.min_stock ?? 0, id]
    );
    if (!result.rows.length) return c.json({ error: "Item not found" }, 404);
    return c.json({ data: result.rows[0] });
  } catch (err: any) {
    console.error("Update item error:", err);
    if (err instanceof z.ZodError) {
      return c.json({ error: err.flatten }, 400);
    }
    return c.json({ error: "Failed to change inventory item" }, 400);
  }
});

// DELETE /items/:id - soft delete
itemRoute.delete("/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const result = await db.query(
      `UPDATE inventory.items
       SET deleted_at = NOW()
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING *`,
      [id]
    );
    if (!result.rows.length)
      return c.json({ error: "Inventory Item not found" }, 404);
    return c.json({ data: result.rows[0] });
  } catch (err) {
    console.error("Delete item error:", err);
    return c.json({ error: "Failed to delete inventory item" }, 400);
  }
});
