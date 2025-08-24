// src/routes/purchaseReturnItem.route.ts
import { Hono } from "hono";
import { db } from "../../db.js";
import { z } from "zod";

export const purchaseReturnItemRoute = new Hono();

// Schema Zod
const purchaseReturnItemSchema = z.object({
  purchase_return_id: z.uuid(),
  item_id: z.uuid(),
  qty: z.number().int().min(1),
});

// GET /purchase-return-items - semua item
purchaseReturnItemRoute.get("/", async (c) => {
  const result = await db.query(
    `SELECT pri.*, i.sku AS item_sku, i.name AS item_name,
            pr.return_number AS return_number
     FROM inventory.purchase_return_items pri
     JOIN inventory.items i ON pri.item_id = i.id
     JOIN inventory.purchase_returns pr ON pri.purchase_return_id = pr.id
     ORDER BY pr.return_date DESC`
  );
  return c.json({ data: result.rows });
});

// GET /purchase-return-items/:id - detail item
purchaseReturnItemRoute.get("/:id", async (c) => {
  const id = c.req.param("id");
  const result = await db.query(
    `SELECT pri.*, i.sku AS item_sku, i.name AS item_name,
            pr.return_number AS return_number
     FROM inventory.purchase_return_items pri
     JOIN inventory.items i ON pri.item_id = i.id
     JOIN inventory.purchase_returns pr ON pri.purchase_return_id = pr.id
     WHERE pri.id = $1`,
    [id]
  );
  const data = result.rows[0];
  if (!data) return c.json({ error: "Purchase return item not found" }, 404);
  return c.json({ data });
});

// POST /purchase-return-items - tambah item
purchaseReturnItemRoute.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const parsed = purchaseReturnItemSchema.parse(body);

    const result = await db.query(
      `INSERT INTO inventory.purchase_return_items
       (id, purchase_return_id, item_id, qty)
       VALUES (gen_random_uuid(), $1, $2, $3)
       RETURNING *`,
      [parsed.purchase_return_id, parsed.item_id, parsed.qty]
    );

    return c.json({ data: result.rows[0] });
  } catch (err: any) {
    console.error("Insert purchase return item error:", err);
    if (err instanceof z.ZodError) return c.json({ error: err.flatten }, 400);
    return c.json({ error: "Gagal menambahkan purchase return item" }, 400);
  }
});

// PUT /purchase-return-items/:id - update item
purchaseReturnItemRoute.put("/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const body = await c.req.json();
    const parsed = purchaseReturnItemSchema.parse(body);

    const result = await db.query(
      `UPDATE inventory.purchase_return_items
       SET purchase_return_id=$1, item_id=$2, qty=$3, updated_at=NOW()
       WHERE id=$4
       RETURNING *`,
      [parsed.purchase_return_id, parsed.item_id, parsed.qty, id]
    );

    if (!result.rows.length)
      return c.json({ error: "Purchase return item not found" }, 404);
    return c.json({ data: result.rows[0] });
  } catch (err: any) {
    console.error("Update purchase return item error:", err);
    if (err instanceof z.ZodError) return c.json({ error: err.flatten }, 400);
    return c.json({ error: "Gagal mengubah purchase return item" }, 400);
  }
});

// DELETE /purchase-return-items/:id - hapus item
purchaseReturnItemRoute.delete("/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const result = await db.query(
      "DELETE FROM inventory.purchase_return_items WHERE id=$1 RETURNING *",
      [id]
    );
    if (!result.rows.length)
      return c.json({ error: "Purchase return item not found" }, 404);
    return c.json({ data: result.rows[0] });
  } catch (err) {
    console.error("Delete purchase return item error:", err);
    return c.json({ error: "Gagal menghapus purchase return item" }, 400);
  }
});
