import { Hono } from "hono";
import { z } from "zod";
import { db } from "../../db.js";

export const stockLocationsRoute = new Hono();

// Zod Schema for validation
const stockLocationsSchema = z.object({
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

// GET /stock-locations - get all locations
stockLocationsRoute.get("/", async (c) => {
  const result = await db.query(
    "SELECT * FROM inventory.stock_locations WHERE deleted_at IS NULL ORDER BY code ASC"
  );
  return c.json({ data: result.rows });
});

// Search by term
stockLocationsRoute.get("/:term/search", async (c) => {
  const term = c.req.param("term");
  const { rows } = await db.query(
    `SELECT id, code, name, type
     FROM inventory.stock_locations
     WHERE deleted_at IS NULL
       AND (code ILIKE $1 OR name ILIKE $1)
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
    SELECT 
  l.id, 
  l.code, 
  l.name,
  COALESCE(sb.qty, 0) AS qty
FROM inventory.stock_locations l
LEFT JOIN inventory.stock_balances sb 
  ON sb.location_id = l.id
  AND sb.item_id = $2   -- pindahkan ke ON
WHERE l.deleted_at IS NULL
  AND (l.code ILIKE $1 OR l.name ILIKE $1)
ORDER BY l.code ASC
LIMIT 20;

    `,
    [`%${term}%`, item_id]
  );

  return c.json({ data: rows });
});

// GET /stock-locations/:id - get location detail
stockLocationsRoute.get("/:id", async (c) => {
  const id = c.req.param("id");
  const result = await db.query(
    "SELECT * FROM inventory.stock_locations WHERE id = $1 AND deleted_at IS NULL",
    [id]
  );
  const data = result.rows[0];
  if (!data) return c.json({ error: "Location not found" }, 404);
  return c.json({ data });
});

// POST /stock-locations - add new location
stockLocationsRoute.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const parsed = stockLocationsSchema.parse(body);

    const result = await db.query(
      `INSERT INTO inventory.stock_locations (id, code, name, description)
       VALUES (gen_random_uuid(), $1, $2, $3)
       RETURNING *`,
      [parsed.code, parsed.name, parsed.description ?? null]
    );
    return c.json({ data: result.rows[0] });
  } catch (err: any) {
    console.error("Insert stock location error:", err);
    if (err instanceof z.ZodError) {
      return c.json({ error: z.treeifyError(err) }, 400);
    }
    return c.json({ error: "Failed to add location" }, 400);
  }
});

// PUT /stock-locations/:id - update location
stockLocationsRoute.put("/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const body = await c.req.json();
    const parsed = stockLocationsSchema.parse(body);

    const result = await db.query(
      `UPDATE inventory.stock_locations
       SET code = $1, name = $2, description = $3, updated_at = NOW()
       WHERE id = $4 AND deleted_at IS NULL
       RETURNING *`,
      [parsed.code, parsed.name, parsed.description ?? null, id]
    );
    if (!result.rows.length)
      return c.json({ error: "Location not found" }, 404);
    return c.json({ data: result.rows[0] });
  } catch (err: any) {
    console.error("Update stock location error:", err);
    if (err instanceof z.ZodError) {
      return c.json({ error: z.treeifyError(err) }, 400);
    }
    return c.json({ error: "Failed to update location" }, 400);
  }
});

// DELETE /stock-locations/:id - soft delete location
stockLocationsRoute.delete("/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const result = await db.query(
      `UPDATE inventory.stock_locations
       SET deleted_at = NOW()
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING *`,
      [id]
    );
    if (!result.rows.length)
      return c.json({ error: "Location not found" }, 404);
    return c.json({ data: result.rows[0], message: "Location deleted (soft)" });
  } catch (err) {
    console.error("Delete stock location error:", err);
    return c.json({ error: "Failed to delete location" }, 400);
  }
});
