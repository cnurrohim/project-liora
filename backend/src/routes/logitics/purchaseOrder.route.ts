// src/routes/purchaseOrder.route.ts
import { Hono } from "hono";
import { db } from "../../db.js";
import { z } from "zod";

export const purchaseOrderRoute = new Hono();

// Schema PO Item
const poItemSchema = z.object({
  item_id: z.uuid(),
  qty: z.number().int().min(1),
  price: z.number().min(0),
});

// Schema PO
const purchaseOrderSchema = z.object({
  order_number: z.string().min(1),
  supplier_id: z.uuid(),
  order_date: z.string().optional(),
  status: z.enum(["draft", "confirmed", "received", "cancelled"]),
  created_by: z.uuid(),
  items: z.array(poItemSchema).min(1),
});

// POST /purchase-orders - create PO + items
purchaseOrderRoute.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const parsed = purchaseOrderSchema.parse(body);

    const client = await db.connect();
    try {
      await client.query("BEGIN");

      const poResult = await client.query(
        `INSERT INTO logistics.purchase_orders
         (id, order_number, supplier_id, order_date, status, created_by)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)
         RETURNING *`,
        [
          parsed.order_number,
          parsed.supplier_id,
          parsed.order_date ?? new Date().toISOString().split("T")[0],
          parsed.status ?? "draft",
          parsed.created_by,
        ]
      );

      const poId = poResult.rows[0].id;

      for (const item of parsed.items) {
        await client.query(
          `INSERT INTO logistics.purchase_order_items
           (id, purchase_order_id, item_id, qty, price)
           VALUES (gen_random_uuid(), $1, $2, $3, $4)`,
          [poId, item.item_id, item.qty, item.price]
        );
      }

      await client.query("COMMIT");

      return c.json({ data: { ...poResult.rows[0], items: parsed.items } });
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error("Create PO error:", err);
    if (err instanceof z.ZodError) return c.json({ error: err.flatten }, 400);
    return c.json({ error: "Gagal membuat purchase order" }, 400);
  }
});

// GET /purchase-orders - semua PO
purchaseOrderRoute.get("/", async (c) => {
  const result = await db.query(
    `SELECT po.*, s.name AS supplier_name
     FROM logistics.purchase_orders po
     JOIN logistics.suppliers s ON po.supplier_id = s.id
     ORDER BY po.order_date DESC, po.created_at DESC`
  );
  return c.json({ data: result.rows });
});

// GET /purchase-orders/:id - detail PO
purchaseOrderRoute.get("/:id", async (c) => {
  const id = c.req.param("id");
  const result = await db.query(
    `SELECT po.*, s.name AS supplier_name
     FROM logistics.purchase_orders po
     JOIN logistics.suppliers s ON po.supplier_id = s.id
     WHERE po.id = $1`,
    [id]
  );
  const data = result.rows[0];
  if (!data) return c.json({ error: "Purchase order not found" }, 404);
  return c.json({ data });
});

// DELETE /purchase-orders/:id - hapus PO
purchaseOrderRoute.delete("/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const result = await db.query(
      "DELETE FROM logistics.purchase_orders WHERE id=$1 RETURNING *",
      [id]
    );
    if (!result.rows.length)
      return c.json({ error: "Purchase order not found" }, 404);
    return c.json({ data: result.rows[0] });
  } catch (err) {
    console.error("Delete purchase order error:", err);
    return c.json({ error: "Gagal menghapus purchase order" }, 400);
  }
});
