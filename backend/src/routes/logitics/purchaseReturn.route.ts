// src/routes/purchaseReturn.route.ts
import { Hono } from "hono";
import { db } from "../../db.js";
import { z } from "zod";

export const purchaseReturnRoute = new Hono();

// Schema Zod
const purchaseReturnSchema = z.object({
  return_number: z.string().min(1),
  purchase_order_id: z.uuid().optional(),
  return_date: z.string().optional(), // YYYY-MM-DD
  reason: z.string().optional(),
  created_by: z.uuid(),
});

// GET /purchase-returns - semua purchase return
purchaseReturnRoute.get("/", async (c) => {
  const result = await db.query(
    `SELECT pr.*, po.order_number AS po_number
     FROM logistics.purchase_returns pr
     LEFT JOIN logistics.purchase_orders po ON pr.purchase_order_id = po.id
     ORDER BY pr.return_date DESC, pr.created_at DESC`
  );
  return c.json({ data: result.rows });
});

// GET /purchase-returns/:id - detail
purchaseReturnRoute.get("/:id", async (c) => {
  const id = c.req.param("id");
  const result = await db.query(
    `SELECT pr.*, po.order_number AS po_number
     FROM logistics.purchase_returns pr
     LEFT JOIN logistics.purchase_orders po ON pr.purchase_order_id = po.id
     WHERE pr.id=$1`,
    [id]
  );
  const data = result.rows[0];
  if (!data) return c.json({ error: "Purchase return not found" }, 404);
  return c.json({ data });
});

// POST /purchase-returns - tambah
purchaseReturnRoute.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const parsed = purchaseReturnSchema.parse(body);

    const result = await db.query(
      `INSERT INTO logistics.purchase_returns
       (id, return_number, purchase_order_id, return_date, reason, created_by)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)
       RETURNING *`,
      [
        parsed.return_number,
        parsed.purchase_order_id ?? null,
        parsed.return_date ?? new Date().toISOString().split("T")[0],
        parsed.reason ?? null,
        parsed.created_by,
      ]
    );

    return c.json({ data: result.rows[0] });
  } catch (err: any) {
    console.error("Insert purchase return error:", err);
    if (err instanceof z.ZodError) return c.json({ error: err.flatten }, 400);
    return c.json({ error: "Gagal menambahkan purchase return" }, 400);
  }
});

// PUT /purchase-returns/:id - update
purchaseReturnRoute.put("/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const body = await c.req.json();
    const parsed = purchaseReturnSchema.parse(body);

    const result = await db.query(
      `UPDATE logistics.purchase_returns
       SET return_number=$1, purchase_order_id=$2, return_date=$3, reason=$4, updated_at=NOW()
       WHERE id=$5
       RETURNING *`,
      [
        parsed.return_number,
        parsed.purchase_order_id ?? null,
        parsed.return_date ?? new Date().toISOString().split("T")[0],
        parsed.reason ?? null,
        id,
      ]
    );

    if (!result.rows.length)
      return c.json({ error: "Purchase return not found" }, 404);
    return c.json({ data: result.rows[0] });
  } catch (err: any) {
    console.error("Update purchase return error:", err);
    if (err instanceof z.ZodError) return c.json({ error: err.flatten }, 400);
    return c.json({ error: "Gagal mengubah purchase return" }, 400);
  }
});

// DELETE /purchase-returns/:id - hapus
purchaseReturnRoute.delete("/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const result = await db.query(
      "DELETE FROM logistics.purchase_returns WHERE id=$1 RETURNING *",
      [id]
    );
    if (!result.rows.length)
      return c.json({ error: "Purchase return not found" }, 404);
    return c.json({ data: result.rows[0] });
  } catch (err) {
    console.error("Delete purchase return error:", err);
    return c.json({ error: "Gagal menghapus purchase return" }, 400);
  }
});
