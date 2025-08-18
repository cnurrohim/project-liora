// src/routes/stockOpname.route.ts
import { Hono } from "hono";
import { db } from "../../db.js";
import { z } from "zod";
import { createStockMovement } from "../../helpers/stockMovement.helper.js";

export const stockOpnameRoute = new Hono();

// Schema Zod
const stockOpnameSchema = z.object({
  item_id: z.uuid(),
  counted_qty: z.number().int().min(0),
  system_qty: z.number().int().min(0),
  opname_date: z.string().optional(), // format YYYY-MM-DD
  opname_by: z.uuid(),
  note: z.string().optional(),
});

// GET /stock-opname - semua opname
stockOpnameRoute.get("/", async (c) => {
  const result = await db.query(
    `SELECT so.*, i.sku AS item_sku, i.name AS item_name
     FROM logistics.stock_opname so
     JOIN logistics.items i ON so.item_id = i.id
     ORDER BY so.opname_date DESC, so.created_at DESC`
  );
  return c.json({ data: result.rows });
});

// GET /stock-opname/:id - detail
stockOpnameRoute.get("/:id", async (c) => {
  const id = c.req.param("id");
  const result = await db.query(
    `SELECT so.*, i.sku AS item_sku, i.name AS item_name
     FROM logistics.stock_opname so
     JOIN logistics.items i ON so.item_id = i.id
     WHERE so.id = $1`,
    [id]
  );
  const data = result.rows[0];
  if (!data) return c.json({ error: "Stock opname not found" }, 404);
  return c.json({ data });
});

// POST /stock-opname - tambah dan buat stock movement otomatis
stockOpnameRoute.post("/", async (c) => {
  const client = await db.connect();
  try {
    const body = await c.req.json();
    const parsed = stockOpnameSchema.parse(body);

    const difference = parsed.counted_qty - parsed.system_qty;

    await client.query("BEGIN");

    // Simpan hasil stock opname
    const result = await client.query(
      `INSERT INTO logistics.stock_opname
       (id, item_id, counted_qty, system_qty, difference, opname_date, opname_by, note)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        parsed.item_id,
        parsed.counted_qty,
        parsed.system_qty,
        difference,
        parsed.opname_date ?? new Date().toISOString().split("T")[0],
        parsed.opname_by,
        parsed.note ?? null,
      ]
    );

    // Buat stock movement jika ada selisih
    if (difference !== 0) {
      await createStockMovement({
        item_id: parsed.item_id,
        movement_type: "adjustment",
        adjustment_direction: difference > 0 ? "increase" : "decrease",
        qty: Math.abs(difference),
        reference_type: "stock_opname",
        reference_id: result.rows[0].id,
        note: parsed.note ?? "Adjustment dari stock opname",
        created_by: parsed.opname_by,
      });
    }

    await client.query("COMMIT");
    return c.json({ data: result.rows[0] });
  } catch (err: any) {
    await client.query("ROLLBACK");
    console.error("Insert stock opname error:", err);
    if (err instanceof z.ZodError) return c.json({ error: err.flatten }, 400);
    return c.json({ error: "Gagal menambahkan stock opname" }, 400);
  } finally {
    client.release();
  }
});

// PUT /stock-opname/:id - update
stockOpnameRoute.put("/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const body = await c.req.json();
    const parsed = stockOpnameSchema.parse(body);

    const difference = parsed.counted_qty - parsed.system_qty;

    const result = await db.query(
      `UPDATE logistics.stock_opname
       SET item_id=$1, counted_qty=$2, system_qty=$3, difference=$4,
           opname_date=$5, opname_by=$6, note=$7, updated_at=NOW()
       WHERE id=$8
       RETURNING *`,
      [
        parsed.item_id,
        parsed.counted_qty,
        parsed.system_qty,
        difference,
        parsed.opname_date ?? new Date().toISOString().split("T")[0],
        parsed.opname_by ?? null,
        parsed.note ?? null,
        id,
      ]
    );
    if (!result.rows.length)
      return c.json({ error: "Stock opname not found" }, 404);
    return c.json({ data: result.rows[0] });
  } catch (err: any) {
    console.error("Update stock opname error:", err);
    if (err instanceof z.ZodError) return c.json({ error: err.flatten }, 400);
    return c.json({ error: "Gagal mengubah stock opname" }, 400);
  }
});

// DELETE /stock-opname/:id - hapus
stockOpnameRoute.delete("/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const result = await db.query(
      "DELETE FROM logistics.stock_opname WHERE id=$1 RETURNING *",
      [id]
    );
    if (!result.rows.length)
      return c.json({ error: "Stock opname not found" }, 404);
    return c.json({ data: result.rows[0] });
  } catch (err) {
    console.error("Delete stock opname error:", err);
    return c.json({ error: "Gagal menghapus stock opname" }, 400);
  }
});
