import { Hono } from "hono";
import { db } from "../../db.js";
import { z } from "zod";
import { authMiddleware } from "../../middleware/auth.js";
import type { Variables } from "../../types/context.js";
import { createStockMovement } from "../../helpers/stockMovement.helper.js";
import { buildWhereQuery } from "../../utils/queryHelper.js";

export const goodsReceiptRoute = new Hono<{ Variables: Variables }>();

goodsReceiptRoute.use(authMiddleware);

// schema item GR
const grItemSchema = z.object({
  item_id: z.uuid(),
  quantity: z.number().min(1),
  notes: z.string().nullable().optional(),
});

// schema header GR
const grSchema = z.object({
  supplier_id: z.uuid(),
  location_id: z.uuid(),
  receipt_date: z.string().optional(),
  notes: z.string().nullable().optional(),
  items: z.array(grItemSchema).min(1),
});

/**
 * POST /goods-receipts - create GR + items
 */
goodsReceiptRoute.post("/", async (c) => {
  const body = await c.req.json();
  const parsed = grSchema.parse(body);
  const user = c.get("user");

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const grRes = await client.query(
      `INSERT INTO inventory.goods_receipts
       (supplier_id, location_id, receipt_date, notes, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        parsed.supplier_id,
        parsed.location_id,
        parsed.receipt_date ?? new Date().toISOString().substring(0, 10),
        parsed.notes ?? null,
        user.id,
      ]
    );

    const grId = grRes.rows[0].id;

    for (const item of parsed.items) {
      // 1. insert item GR
      await client.query(
        `INSERT INTO inventory.goods_receipt_items
         (goods_receipt_id, item_id, quantity, notes)
         VALUES ($1, $2, $3, $4)`,
        [grId, item.item_id, item.quantity, item.notes ?? null]
      );

      // 2. buat stock movement inbound
      await createStockMovement(
        {
          item_id: item.item_id,
          movement_type: "inbound",
          adjustment_direction: "increase",
          qty: item.quantity,
          reference_type: "goods_receipt",
          reference_id: grId,
          note: `Goods Receipt ${grRes.rows[0].receipt_number ?? ""}`,
          created_by: user.id,
          target_location_id: parsed.location_id,
        },
        client
      );
    }

    await client.query("COMMIT");

    return c.json({
      data: { ...grRes.rows[0], items: parsed.items },
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Create GR error:", err);
    return c.json({ error: "Failed to create goods receipt" }, 400);
  } finally {
    client.release();
  }
});

/**
 * GET /goods-receipts - list semua GR
 */
goodsReceiptRoute.get("/", async (c) => {
  const receipt_number = c.req.query("receipt_number");
  const { whereSQL, params } = buildWhereQuery({ receipt_number }, "gr");

  const finalWhere =
    whereSQL === ""
      ? "WHERE gr.deleted_at IS NULL"
      : whereSQL.replace("WHERE", "WHERE gr.deleted_at IS NULL AND");

  const sql = `SELECT gr.*, s.name AS supplier_name
     FROM inventory.goods_receipts gr
     JOIN inventory.suppliers s ON gr.supplier_id = s.id
     ${finalWhere}
     ORDER BY gr.receipt_date DESC, gr.created_at DESC, gr.receipt_number desc`;

  const { rows } = await db.query(sql, params);
  return c.json({ data: rows });
});

goodsReceiptRoute.get("/:id/detail", async (c) => {
  const id = c.req.param("id");

  try {
    const grRes = await db.query(
      `
      SELECT 
        gr.id,
        gr.receipt_number,
        gr.receipt_date,
        gr.notes,
        gr.supplier_id,
        gr.location_id,
        s.name AS supplier_name,
        sl.code || ' ' || sl.name AS stored_location,
        u.name AS created_by,

        -- items
        COALESCE(
          json_agg(
            json_build_object(
              'id', gri.id,
              'item_id', gri.item_id,
              'sku', i.sku,
              'item_name', i.name,
              'qty', gri.quantity,
              'notes', gri.notes
            )
          ) FILTER (WHERE gri.id IS NOT NULL),
          '[]'
        ) AS items,

        -- stock movements
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', sm.id,
                'item_id', sm.item_id,
                'sku', i2.sku,
                'item_name', i2.name,
                'movement_type', sm.movement_type,
                'adjustment_direction', sm.adjustment_direction,
                'qty', sm.qty,
                'balance_after', sm.balance_after,
                'reference_id', sm.reference_id,
                'reference_type', sm.reference_type,
                'note', sm.note,
                'created_at', sm.created_at,
                'created_by', sm.created_by,
                'stored_location', sl.code || ' ' || sl.name
              ) ORDER BY sm.created_at
            )
            FROM inventory.stock_movements sm
            JOIN inventory.items i2 ON i2.id = sm.item_id
            JOIN inventory.stock_locations sl ON sl.id = sm.target_location_id
            WHERE sm.reference_type = 'goods_receipt'
              AND sm.reference_id = gr.id
          ),
          '[]'
        ) AS stock_movements

      FROM inventory.goods_receipts gr
      JOIN inventory.suppliers s ON s.id = gr.supplier_id
      JOIN inventory.stock_locations sl ON sl.id = gr.location_id
      JOIN public.users u ON u.id = gr.created_by
      LEFT JOIN inventory.goods_receipt_items gri ON gri.goods_receipt_id = gr.id
      LEFT JOIN inventory.items i ON i.id = gri.item_id
      WHERE gr.id = $1 AND gr.deleted_at IS NULL
      GROUP BY gr.id, s.name, u.name, sl.code, sl.name
      `,
      [id]
    );

    const gr = grRes.rows[0];
    if (!gr) return c.json({ error: "Goods receipt not found" }, 404);

    return c.json({ data: gr });
  } catch (err) {
    console.error("Get goods receipt detail error:", err);
    return c.json({ error: "Gagal mengambil detail goods receipt" }, 400);
  }
});

/**
 * GET /goods-receipts/:id - detail GR + items
 */
goodsReceiptRoute.get("/:id", async (c) => {
  const id = c.req.param("id");

  // header
  const grRes = await db.query(
    `SELECT gr.*, s.name AS supplier_name
     FROM inventory.goods_receipts gr
     JOIN inventory.suppliers s ON gr.supplier_id = s.id
     WHERE gr.id = $1 AND gr.deleted_at IS NULL`,
    [id]
  );
  if (!grRes.rows.length)
    return c.json({ error: "Goods receipt not found" }, 404);

  // items
  const itemsRes = await db.query(
    `SELECT gri.*, i.sku, i.name AS item_name
     FROM inventory.goods_receipt_items gri
     JOIN inventory.items i ON gri.item_id = i.id
     WHERE gri.goods_receipt_id = $1`,
    [id]
  );

  return c.json({ data: { ...grRes.rows[0], items: itemsRes.rows } });
});

/**
 * GET /goods-receipts/:term/search - search by receipt_number
 */
goodsReceiptRoute.get("/:term/search", async (c) => {
  const term = c.req.param("term");
  const { rows } = await db.query(
    `SELECT gr.id, gr.receipt_number, s.name AS supplier_name
     FROM inventory.goods_receipts gr
     JOIN inventory.suppliers s ON gr.supplier_id = s.id
     WHERE gr.receipt_number ILIKE $1
       AND gr.deleted_at IS NULL
     ORDER BY gr.created_at DESC
     LIMIT 20`,
    [`%${term}%`]
  );
  return c.json({ data: rows });
});

/**
 * PUT /goods-receipts/:id - update header + items
 */
goodsReceiptRoute.put("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const parsed = grSchema.parse(body);

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    await client.query(
      `UPDATE inventory.goods_receipts
       SET supplier_id=$1, location_id=$2, receipt_date=$3, notes=$4
       WHERE id=$5 AND deleted_at IS NULL`,
      [
        parsed.supplier_id,
        parsed.location_id,
        parsed.receipt_date ?? new Date().toISOString().substring(0, 10),
        parsed.notes ?? null,
        id,
      ]
    );

    await client.query(
      `DELETE FROM inventory.goods_receipt_items WHERE goods_receipt_id=$1`,
      [id]
    );

    for (const item of parsed.items) {
      await client.query(
        `INSERT INTO inventory.goods_receipt_items
         (goods_receipt_id, item_id, quantity, notes)
         VALUES ($1, $2, $3, $4)`,
        [id, item.item_id, item.quantity, item.notes ?? null]
      );
    }

    await client.query("COMMIT");
    return c.json({ data: { id, ...parsed } });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Update GR error:", err);
    return c.json({ error: "Gagal mengupdate goods receipt" }, 400);
  } finally {
    client.release();
  }
});

/**
 * DELETE /goods-receipts/:id - soft delete
 */
goodsReceiptRoute.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const { rows } = await db.query(
    `UPDATE inventory.goods_receipts
     SET deleted_at = now()
     WHERE id = $1 AND deleted_at IS NULL
     RETURNING *`,
    [id]
  );
  if (!rows.length) return c.json({ error: "Goods receipt not found" }, 404);
  return c.json({ data: rows[0] });
});
