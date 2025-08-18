// src/routes/salesReturn.route.ts
import { Hono } from "hono";
import { db } from "../../db.js";
import { z } from "zod";

export const salesReturnRoute = new Hono();

// Schema Zod
const salesReturnSchema = z.object({
  return_number: z.string().min(1),
  sales_order_id: z.uuid().optional(),
  return_date: z.string().optional(), // YYYY-MM-DD
  reason: z.string().optional(),
  created_by: z.uuid(),
});

// GET /sales-returns - semua sales return
salesReturnRoute.get("/", async (c) => {
  const result = await db.query(
    `SELECT sr.*, so.order_number AS so_number
     FROM logistics.sales_returns sr
     LEFT JOIN logistics.sales_orders so ON sr.sales_order_id = so.id
     ORDER BY sr.return_date DESC, sr.created_at DESC`
  );
  return c.json({ data: result.rows });
});

// GET /sales-returns/:id - detail
salesReturnRoute.get("/:id", async (c) => {
  const id = c.req.param("id");
  const result = await db.query(
    `SELECT sr.*, so.order_number AS so_number
     FROM logistics.sales_returns sr
     LEFT JOIN logistics.sales_orders so ON sr.sales_order_id = so.id
     WHERE sr.id=$1`,
    [id]
  );
  const data = result.rows[0];
  if (!data) return c.json({ error: "Sales return not found" }, 404);
  return c.json({ data });
});

// POST /sales-returns - tambah
salesReturnRoute.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const parsed = salesReturnSchema.parse(body);

    const result = await db.query(
      `INSERT INTO logistics.sales_returns
       (id, return_number, sales_order_id, return_date, reason, created_by)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)
       RETURNING *`,
      [
        parsed.return_number,
        parsed.sales_order_id ?? null,
        parsed.return_date ?? new Date().toISOString().split("T")[0],
        parsed.reason ?? null,
        parsed.created_by,
      ]
    );

    return c.json({ data: result.rows[0] });
  } catch (err: any) {
    console.error("Insert sales return error:", err);
    if (err instanceof z.ZodError) return c.json({ error: err.flatten }, 400);
    return c.json({ error: "Gagal menambahkan sales return" }, 400);
  }
});

// PUT /sales-returns/:id - update
salesReturnRoute.put("/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const body = await c.req.json();
    const parsed = salesReturnSchema.parse(body);

    const result = await db.query(
      `UPDATE logistics.sales_returns
       SET return_number=$1, sales_order_id=$2, return_date=$3, reason=$4, updated_at=NOW()
       WHERE id=$5
       RETURNING *`,
      [
        parsed.return_number,
        parsed.sales_order_id ?? null,
        parsed.return_date ?? new Date().toISOString().split("T")[0],
        parsed.reason ?? null,
        id,
      ]
    );

    if (!result.rows.length)
      return c.json({ error: "Sales return not found" }, 404);
    return c.json({ data: result.rows[0] });
  } catch (err: any) {
    console.error("Update sales return error:", err);
    if (err instanceof z.ZodError) return c.json({ error: err.flatten }, 400);
    return c.json({ error: "Gagal mengubah sales return" }, 400);
  }
});

// DELETE /sales-returns/:id - hapus
salesReturnRoute.delete("/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const result = await db.query(
      "DELETE FROM logistics.sales_returns WHERE id=$1 RETURNING *",
      [id]
    );
    if (!result.rows.length)
      return c.json({ error: "Sales return not found" }, 404);
    return c.json({ data: result.rows[0] });
  } catch (err) {
    console.error("Delete sales return error:", err);
    return c.json({ error: "Gagal menghapus sales return" }, 400);
  }
});
