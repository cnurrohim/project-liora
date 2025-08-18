// src/routes/stockMovement.route.ts
import { Hono } from "hono";
import { db } from "../../db.js";
import { z } from "zod";

export const stockMovementRoute = new Hono();

// Schema Zod
const stockMovementSchema = z.object({
  item_id: z.uuid(),
  movement_type: z.enum(["inbound", "outbound", "adjustment"]),
  adjustment_direction: z.enum(["increase", "decrease"]),
  qty: z.number().int().min(1),
  reference_type: z.enum([
    "purchase_order",
    "sales_order",
    "sales_return",
    "purchase_return",
    "stock_opname",
    "manual_adjustment",
  ]),
  reference_id: z.uuid().optional(),
  note: z.string().optional(),
  created_by: z.uuid(),
});

// GET /stock-movements - semua ledger
stockMovementRoute.get("/", async (c) => {
  const result = await db.query(
    `SELECT sm.*, i.sku AS item_sku, i.name AS item_name
     FROM logistics.stock_movements sm
     JOIN logistics.items i ON sm.item_id = i.id
     ORDER BY sm.created_at DESC`
  );
  return c.json({ data: result.rows });
});

// GET /stock-movements/:id - detail
stockMovementRoute.get("/:id", async (c) => {
  const id = c.req.param("id");
  const result = await db.query(
    `SELECT sm.*, i.sku AS item_sku, i.name AS item_name
     FROM logistics.stock_movements sm
     JOIN logistics.items i ON sm.item_id = i.id
     WHERE sm.id = $1`,
    [id]
  );
  if (!result.rows.length)
    return c.json({ error: "Stock movement not found" }, 404);
  return c.json({ data: result.rows[0] });
});

// POST /stock-movements - tambah ledger otomatis balance_after
stockMovementRoute.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const parsed = stockMovementSchema.parse(body);

    // Validasi movement_type & adjustment_direction
    if (
      (parsed.movement_type === "inbound" &&
        parsed.adjustment_direction !== "increase") ||
      (parsed.movement_type === "outbound" &&
        parsed.adjustment_direction !== "decrease")
    ) {
      return c.json(
        { error: "Kombinasi movement_type & adjustment_direction tidak valid" },
        400
      );
    }

    const client = await db.connect();
    try {
      await client.query("BEGIN");

      // Ambil saldo terakhir
      const lastResult = await client.query(
        `SELECT balance_after FROM logistics.stock_movements
         WHERE item_id=$1 ORDER BY created_at DESC LIMIT 1`,
        [parsed.item_id]
      );
      const lastBalance = lastResult.rows[0]?.balance_after ?? 0;

      // Hitung balance_after otomatis
      const balance_after =
        parsed.adjustment_direction === "increase"
          ? lastBalance + parsed.qty
          : lastBalance - parsed.qty;

      // Insert stock movement baru
      const result = await client.query(
        `INSERT INTO logistics.stock_movements
         (id, item_id, movement_type, adjustment_direction, qty, balance_after,
          reference_type, reference_id, note, created_by)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [
          parsed.item_id,
          parsed.movement_type,
          parsed.adjustment_direction,
          parsed.qty,
          balance_after,
          parsed.reference_type,
          parsed.reference_id ?? null,
          parsed.note ?? null,
          parsed.created_by,
        ]
      );

      await client.query("COMMIT");
      return c.json({ data: result.rows[0] });
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error("Insert stock movement error:", err);
    if (err instanceof z.ZodError) return c.json({ error: err.flatten() }, 400);
    return c.json({ error: "Gagal menambahkan stock movement" }, 400);
  }
});

// DELETE /stock-movements/:id
stockMovementRoute.delete("/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const result = await db.query(
      "DELETE FROM logistics.stock_movements WHERE id=$1 RETURNING *",
      [id]
    );
    if (!result.rows.length)
      return c.json({ error: "Stock movement not found" }, 404);
    return c.json({ data: result.rows[0] });
  } catch (err) {
    console.error("Delete stock movement error:", err);
    return c.json({ error: "Gagal menghapus stock movement" }, 400);
  }
});
