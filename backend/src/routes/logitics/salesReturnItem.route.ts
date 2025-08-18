// src/routes/salesReturnItem.route.ts
import { Hono } from "hono";
import { db } from "../../db.js";
import { z } from "zod";

export const salesReturnItemRoute = new Hono();

// Schema Zod
const salesReturnItemSchema = z.object({
  sales_return_id: z.uuid(),
  item_id: z.uuid(),
  qty: z.number().int().min(1),
});

// GET /sales-return-items - semua item
salesReturnItemRoute.get("/", async (c) => {
  const result = await db.query(
    `SELECT sri.*, i.sku AS item_sku, i.name AS item_name,
            sr.return_number AS return_number
     FROM logistics.sales_return_items sri
     JOIN logistics.items i ON sri.item_id = i.id
     JOIN logistics.sales_returns sr ON sri.sales_return_id = sr.id
     ORDER BY sr.return_date DESC`
  );
  return c.json({ data: result.rows });
});

// GET /sales-return-items/:id - detail item
salesReturnItemRoute.get("/:id", async (c) => {
  const id = c.req.param("id");
  const result = await db.query(
    `SELECT sri.*, i.sku AS item_sku, i.name AS item_name,
            sr.return_number AS return_number
     FROM logistics.sales_return_items sri
     JOIN logistics.items i ON sri.item_id = i.id
     JOIN logistics.sales_returns sr ON sri.sales_return_id = sr.id
     WHERE sri.id = $1`,
    [id]
  );
  const data = result.rows[0];
  if (!data) return c.json({ error: "Sales return item not found" }, 404);
  return c.json({ data });
});

// POST /sales-return-items - tambah item
salesReturnItemRoute.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const parsed = salesReturnItemSchema.parse(body);

    const result = await db.query(
      `INSERT INTO logistics.sales_return_items
       (id, sales_return_id, item_id, qty)
       VALUES (gen_random_uuid(), $1, $2, $3)
       RETURNING *`,
      [parsed.sales_return_id, parsed.item_id, parsed.qty]
    );

    return c.json({ data: result.rows[0] });
  } catch (err: any) {
    console.error("Insert sales return item error:", err);
    if (err instanceof z.ZodError) return c.json({ error: err.flatten }, 400);
    return c.json({ error: "Gagal menambahkan sales return item" }, 400);
  }
});

// PUT /sales-return-items/:id - update item
salesReturnItemRoute.put("/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const body = await c.req.json();
    const parsed = salesReturnItemSchema.parse(body);

    const result = await db.query(
      `UPDATE logistics.sales_return_items
       SET sales_return_id=$1, item_id=$2, qty=$3, updated_at=NOW()
       WHERE id=$4
       RETURNING *`,
      [parsed.sales_return_id, parsed.item_id, parsed.qty, id]
    );

    if (!result.rows.length)
      return c.json({ error: "Sales return item not found" }, 404);
    return c.json({ data: result.rows[0] });
  } catch (err: any) {
    console.error("Update sales return item error:", err);
    if (err instanceof z.ZodError) return c.json({ error: err.flatten }, 400);
    return c.json({ error: "Gagal mengubah sales return item" }, 400);
  }
});

// DELETE /sales-return-items/:id - hapus item
salesReturnItemRoute.delete("/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const result = await db.query(
      "DELETE FROM logistics.sales_return_items WHERE id=$1 RETURNING *",
      [id]
    );
    if (!result.rows.length)
      return c.json({ error: "Sales return item not found" }, 404);
    return c.json({ data: result.rows[0] });
  } catch (err) {
    console.error("Delete sales return item error:", err);
    return c.json({ error: "Gagal menghapus sales return item" }, 400);
  }
});
