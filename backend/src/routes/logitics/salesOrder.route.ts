// src/routes/salesOrder.route.ts
import { Hono } from "hono";
import { db } from "../../db.js";
import { z } from "zod";

export const salesOrderRoute = new Hono();

// Schema SO Item
const soItemSchema = z.object({
  item_id: z.uuid(),
  qty: z.number().int().min(1),
  price: z.number().min(0),
});

// Schema SO
const salesOrderSchema = z.object({
  order_number: z.string().min(1),
  customer_name: z.string().min(1),
  order_date: z.string().optional(),
  status: z.enum(["draft", "confirmed", "shipped", "cancelled"]),
  created_by: z.uuid(),
  items: z.array(soItemSchema).min(1),
});

// POST /sales-orders - create SO + items
salesOrderRoute.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const parsed = salesOrderSchema.parse(body);

    const client = await db.connect();
    try {
      await client.query("BEGIN");

      const soResult = await client.query(
        `INSERT INTO logistics.sales_orders
         (id, order_number, customer_name, order_date, status, created_by)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)
         RETURNING *`,
        [
          parsed.order_number,
          parsed.customer_name,
          parsed.order_date ?? new Date().toISOString().split("T")[0],
          parsed.status ?? "draft",
          parsed.created_by,
        ]
      );

      const soId = soResult.rows[0].id;

      for (const item of parsed.items) {
        await client.query(
          `INSERT INTO logistics.sales_order_items
           (id, sales_order_id, item_id, qty, price)
           VALUES (gen_random_uuid(), $1, $2, $3, $4)`,
          [soId, item.item_id, item.qty, item.price]
        );
      }

      await client.query("COMMIT");

      return c.json({ data: { ...soResult.rows[0], items: parsed.items } });
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error("Create SO error:", err);
    if (err instanceof z.ZodError) return c.json({ error: err.flatten }, 400);
    return c.json({ error: "Gagal membuat sales order" }, 400);
  }
});

// GET /sales-orders - semua SO
salesOrderRoute.get("/", async (c) => {
  const result = await db.query(
    `SELECT * FROM logistics.sales_orders
     ORDER BY order_date DESC, created_at DESC`
  );
  return c.json({ data: result.rows });
});

// GET /sales-orders/:id - detail SO
salesOrderRoute.get("/:id", async (c) => {
  const id = c.req.param("id");
  const result = await db.query(
    `SELECT * FROM logistics.sales_orders WHERE id=$1`,
    [id]
  );
  const data = result.rows[0];
  if (!data) return c.json({ error: "Sales order not found" }, 404);
  return c.json({ data });
});

// DELETE /sales-orders/:id - hapus SO
salesOrderRoute.delete("/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const result = await db.query(
      "DELETE FROM logistics.sales_orders WHERE id=$1 RETURNING *",
      [id]
    );
    if (!result.rows.length)
      return c.json({ error: "Sales order not found" }, 404);
    return c.json({ data: result.rows[0] });
  } catch (err) {
    console.error("Delete sales order error:", err);
    return c.json({ error: "Gagal menghapus sales order" }, 400);
  }
});
