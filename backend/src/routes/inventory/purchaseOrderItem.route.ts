import { Hono } from "hono";
import { db } from "../../db.js";
import { z } from "zod";

export const purchaseOrderItemRoute = new Hono();

// Schema Zod
const purchaseOrderItemSchema = z.object({
  purchase_order_id: z.uuid(),
  item_id: z.uuid(),
  qty: z.number().int().min(1),
  price: z.number().min(0).optional(),
  received_qty: z.number().int().min(0).optional(),
});

// GET /purchase-order-items - all items
purchaseOrderItemRoute.get("/", async (c) => {
  const result = await db.query(
    `SELECT poi.*, i.sku AS item_sku, i.name AS item_name,
            po.order_number AS po_number
     FROM inventory.purchase_order_items poi
     JOIN inventory.items i ON poi.item_id = i.id AND i.deleted_at IS NULL
     JOIN inventory.purchase_orders po ON poi.purchase_order_id = po.id AND po.deleted_at IS NULL
     WHERE poi.deleted_at IS NULL
     ORDER BY po.order_date DESC`
  );
  return c.json({ data: result.rows });
});

// GET /purchase-order-items/:id - item detail
purchaseOrderItemRoute.get("/:id", async (c) => {
  const id = c.req.param("id");
  const result = await db.query(
    `SELECT poi.*, i.sku AS item_sku, i.name AS item_name,
            po.order_number AS po_number
     FROM inventory.purchase_order_items poi
     JOIN inventory.items i ON poi.item_id = i.id AND i.deleted_at IS NULL
     JOIN inventory.purchase_orders po ON poi.purchase_order_id = po.id AND po.deleted_at IS NULL
     WHERE poi.id = $1 AND poi.deleted_at IS NULL`,
    [id]
  );
  const data = result.rows[0];
  if (!data) return c.json({ error: "Purchase order item not found" }, 404);
  return c.json({ data });
});

// POST /purchase-order-items - add item
purchaseOrderItemRoute.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const parsed = purchaseOrderItemSchema.parse(body);

    const result = await db.query(
      `INSERT INTO inventory.purchase_order_items
       (id, purchase_order_id, item_id, qty, price, received_qty)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)
       RETURNING *`,
      [
        parsed.purchase_order_id,
        parsed.item_id,
        parsed.qty,
        parsed.price ?? 0,
        parsed.received_qty ?? 0,
      ]
    );

    return c.json({ data: result.rows[0] });
  } catch (err: any) {
    console.error("Insert purchase order item error:", err);
    if (err instanceof z.ZodError) return c.json({ error: err.flatten }, 400);
    return c.json({ error: "Failed to add purchase order item" }, 400);
  }
});

// PUT /purchase-order-items/:id - update item
purchaseOrderItemRoute.put("/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const body = await c.req.json();
    const parsed = purchaseOrderItemSchema.parse(body);

    const result = await db.query(
      `UPDATE inventory.purchase_order_items
       SET purchase_order_id=$1, item_id=$2, qty=$3, price=$4, received_qty=$5, updated_at=NOW()
       WHERE id=$6 AND deleted_at IS NULL
       RETURNING *`,
      [
        parsed.purchase_order_id,
        parsed.item_id,
        parsed.qty,
        parsed.price ?? 0,
        parsed.received_qty ?? 0,
        id,
      ]
    );

    if (!result.rows.length)
      return c.json({ error: "Purchase order item not found" }, 404);
    return c.json({ data: result.rows[0] });
  } catch (err: any) {
    console.error("Update purchase order item error:", err);
    if (err instanceof z.ZodError) return c.json({ error: err.flatten }, 400);
    return c.json({ error: "Failed to update purchase order item" }, 400);
  }
});

// DELETE /purchase-order-items/:id - soft delete item
purchaseOrderItemRoute.delete("/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const result = await db.query(
      `UPDATE inventory.purchase_order_items
       SET deleted_at = NOW()
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING *`,
      [id]
    );
    if (!result.rows.length)
      return c.json({ error: "Purchase order item not found" }, 404);
    return c.json({ data: result.rows[0] });
  } catch (err) {
    console.error("Soft delete purchase order item error:", err);
    return c.json({ error: "Failed to delete purchase order item" }, 400);
  }
});
