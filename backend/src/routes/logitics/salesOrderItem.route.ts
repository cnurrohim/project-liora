// src/routes/salesOrderItem.route.ts
import { Hono } from "hono";
import { db } from "../../db.js";
import { z } from "zod";

export const salesOrderItemRoute = new Hono();

// Schema Zod
const salesOrderItemSchema = z.object({
  sales_order_id: z.uuid(),
  item_id: z.uuid(),
  qty: z.number().int().min(1),
  price: z.number().min(0).optional(),
  shipped_qty: z.number().int().min(0).optional(),
});

// GET /sales-order-items - semua item SO
salesOrderItemRoute.get("/", async (c) => {
  const result = await db.query(
    `SELECT soi.*, i.sku AS item_sku, i.name AS item_name,
            so.order_number AS so_number
     FROM logistics.sales_order_items soi
     JOIN logistics.items i ON soi.item_id = i.id
     JOIN logistics.sales_orders so ON soi.sales_order_id = so.id
     ORDER BY so.order_date DESC`
  );
  return c.json({ data: result.rows });
});

// GET /sales-order-items/:id - detail item SO
salesOrderItemRoute.get("/:id", async (c) => {
  const id = c.req.param("id");
  const result = await db.query(
    `SELECT soi.*, i.sku AS item_sku, i.name AS item_name,
            so.order_number AS so_number
     FROM logistics.sales_order_items soi
     JOIN logistics.items i ON soi.item_id = i.id
     JOIN logistics.sales_orders so ON soi.sales_order_id = so.id
     WHERE soi.id = $1`,
    [id]
  );
  const data = result.rows[0];
  if (!data) return c.json({ error: "Sales order item not found" }, 404);
  return c.json({ data });
});

// POST /sales-order-items - tambah item SO
salesOrderItemRoute.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const parsed = salesOrderItemSchema.parse(body);

    const result = await db.query(
      `INSERT INTO logistics.sales_order_items
       (id, sales_order_id, item_id, qty, price, shipped_qty)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)
       RETURNING *`,
      [
        parsed.sales_order_id,
        parsed.item_id,
        parsed.qty,
        parsed.price ?? 0,
        parsed.shipped_qty ?? 0,
      ]
    );

    return c.json({ data: result.rows[0] });
  } catch (err: any) {
    console.error("Insert sales order item error:", err);
    if (err instanceof z.ZodError) return c.json({ error: err.flatten }, 400);
    return c.json({ error: "Gagal menambahkan sales order item" }, 400);
  }
});

// PUT /sales-order-items/:id - update item SO
salesOrderItemRoute.put("/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const body = await c.req.json();
    const parsed = salesOrderItemSchema.parse(body);

    const result = await db.query(
      `UPDATE logistics.sales_order_items
       SET sales_order_id=$1, item_id=$2, qty=$3, price=$4, shipped_qty=$5, updated_at=NOW()
       WHERE id=$6
       RETURNING *`,
      [
        parsed.sales_order_id,
        parsed.item_id,
        parsed.qty,
        parsed.price ?? 0,
        parsed.shipped_qty ?? 0,
        id,
      ]
    );

    if (!result.rows.length)
      return c.json({ error: "Sales order item not found" }, 404);
    return c.json({ data: result.rows[0] });
  } catch (err: any) {
    console.error("Update sales order item error:", err);
    if (err instanceof z.ZodError) return c.json({ error: err.flatten }, 400);
    return c.json({ error: "Gagal mengubah sales order item" }, 400);
  }
});

// DELETE /sales-order-items/:id - hapus item SO
salesOrderItemRoute.delete("/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const result = await db.query(
      "DELETE FROM logistics.sales_order_items WHERE id=$1 RETURNING *",
      [id]
    );
    if (!result.rows.length)
      return c.json({ error: "Sales order item not found" }, 404);
    return c.json({ data: result.rows[0] });
  } catch (err) {
    console.error("Delete sales order item error:", err);
    return c.json({ error: "Gagal menghapus sales order item" }, 400);
  }
});
