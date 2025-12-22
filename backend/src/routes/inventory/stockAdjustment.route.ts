import { Hono } from "hono";
import { db } from "../../db.js";
import { z } from "zod";
import { authMiddleware } from "../../middleware/auth.js";
import type { Variables } from "../../types/context.js";
import { createStockMovement } from "../../helpers/stockMovement.helper.js";
import { buildWhereQuery } from "../../utils/queryHelper.js";

export const stockAdjustmentRoute = new Hono<{ Variables: Variables }>();

stockAdjustmentRoute.use(authMiddleware);

// schema item Adjustment
const adjItemSchema = z.object({
  item_id: z.uuid(),
  location_id: z.uuid(),
  quantity_diff: z.number().refine((n) => n !== 0, {
    message: "quantity_diff tidak boleh 0",
  }),
  quantity_before: z.number(),
  notes: z.string().nullable().optional(),
});

// schema header Adjustment
const adjSchema = z.object({
  adjustment_date: z.string().optional(),
  reason: z.string().nullable().optional(),
  items: z.array(adjItemSchema).min(1),
});

/**
 * POST /stock-adjustments - create adjustment (draft) + items
 */
stockAdjustmentRoute.post("/", async (c) => {
  const body = await c.req.json();
  const parsed = adjSchema.parse(body);
  const user = c.get("user");

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const adjRes = await client.query(
      `INSERT INTO inventory.stock_adjustments
       (adjustment_date, reason, status, created_by)
       VALUES ($1, $2, 'draft', $3)
       RETURNING *`,
      [
        parsed.adjustment_date ?? new Date().toISOString().substring(0, 10),
        parsed.reason ?? null,
        user.id,
      ]
    );

    const adjId = adjRes.rows[0].id;

    for (const item of parsed.items) {
      await client.query(
        `INSERT INTO inventory.stock_adjustment_items
         (adjustment_id, item_id, location_id, quantity_before, quantity_diff, notes)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          adjId,
          item.item_id,
          item.location_id,
          item.quantity_before,
          item.quantity_diff,
          item.notes ?? null,
        ]
      );
    }

    await client.query("COMMIT");

    return c.json({
      data: { ...adjRes.rows[0], items: parsed.items },
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Create Adjustment error:", err);
    return c.json({ error: "Failed to create stock adjustment" }, 400);
  } finally {
    client.release();
  }
});

/**
 * GET /stock-adjustments - list semua Adjustment
 */
stockAdjustmentRoute.get("/", async (c) => {
  const adjustment_number = c.req.query("adjustment_number");

  const { whereSQL, params } = buildWhereQuery({ adjustment_number }, "sa");

  const { rows } = await db.query(
    `SELECT sa.*, u.name AS created_by
     FROM inventory.stock_adjustments sa
     JOIN public.users u ON sa.created_by = u.id
     ${whereSQL}
     ORDER BY sa.adjustment_date DESC, sa.created_at DESC`,
    params
  );
  return c.json({ data: rows });
});

/**
 * GET /goods-receipts/:id - detail GR + items
 */
stockAdjustmentRoute.get("/:id", async (c) => {
  const id = c.req.param("id");

  // header
  const grRes = await db.query(
    `SELECT sa.*, u.name AS created_by_name
     FROM inventory.stock_adjustments sa
     JOIN public.users u ON sa.created_by = u.id
     WHERE sa.id = $1`,
    [id]
  );
  if (!grRes.rows.length)
    return c.json({ error: "Goods receipt not found" }, 404);

  // items
  const itemsRes = await db.query(
    `SELECT sai.*, i.sku, i.name AS item_name
     FROM inventory.stock_adjustment_items sai
     JOIN public.users u ON sai.created_by = u.id
     WHERE sai.stock_adjustment_id = $1`,
    [id]
  );

  return c.json({ data: { ...grRes.rows[0], items: itemsRes.rows } });
});

/**
 * GET /stock-adjustments/:id/detail - detail Adjustment lengkap
 */
stockAdjustmentRoute.get("/:id/detail", async (c) => {
  const id = c.req.param("id");

  try {
    const saRes = await db.query(
      `
      SELECT 
        sa.id,
        sa.adjustment_number,
        sa.adjustment_date,
        sa.reason,
        sa.status,
        u.name AS created_by,

        -- items
        COALESCE(
          json_agg(
            json_build_object(
              'id', sai.id,
              'item_id', sai.item_id,
              'sku', i.sku,
              'item_name', i.name,
              'quantity_before', sai.quantity_before,
              'quantity_diff', sai.quantity_diff,
              'location', sl.code || ' ' || sl.name,
              'notes', sai.notes
            )
          ) FILTER (WHERE sai.id IS NOT NULL),
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
                'target_location', tl.code || ' ' || tl.name,
                'balance_after', sm.balance_after,
                'reference_id', sm.reference_id,
                'reference_type', sm.reference_type,
                'note', sm.note,
                'created_at', sm.created_at,
                'created_by', sm.created_by
              ) ORDER BY sm.created_at
            )
            FROM inventory.stock_movements sm
            JOIN inventory.items i2 ON i2.id = sm.item_id
            LEFT JOIN inventory.stock_locations tl on tl.id = sm.target_location_id
            WHERE sm.reference_type = 'stock_adjustment'
              AND sm.reference_id = sa.id
          ),
          '[]'
        ) AS stock_movements

      FROM inventory.stock_adjustments sa
      JOIN public.users u ON u.id = sa.created_by
      LEFT JOIN inventory.stock_adjustment_items sai ON sai.adjustment_id = sa.id
      LEFT JOIN inventory.stock_locations sl on sl.id = sai.location_id
      LEFT JOIN inventory.items i ON i.id = sai.item_id
      WHERE sa.id = $1
      GROUP BY sa.id, u.name
      `,
      [id]
    );

    const sa = saRes.rows[0];
    if (!sa) return c.json({ error: "Stock adjustment not found" }, 404);

    return c.json({ data: sa });
  } catch (err) {
    console.error("Get stock adjustment detail error:", err);
    return c.json({ error: "Failed to fetch stock adjustment detail" }, 400);
  }
});

/**
 * PATCH /stock-adjustments/:id/confirm - ubah status draft → confirmed + create stock movements
 */
stockAdjustmentRoute.patch("/:id/confirm", async (c) => {
  const id = c.req.param("id");
  const user = c.get("user");

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    // 1. pastikan masih draft
    const { rows: adjRows } = await client.query(
      `SELECT * FROM inventory.stock_adjustments WHERE id = $1 AND status = 'draft'`,
      [id]
    );
    if (adjRows.length === 0) {
      await client.query("ROLLBACK");
      return c.json(
        {
          error: "Stock adjustment not found or already confirmed/cancelled",
        },
        400
      );
    }

    const adj = adjRows[0];

    // 2. ambil items
    const { rows: items } = await client.query(
      `SELECT * FROM inventory.stock_adjustment_items WHERE adjustment_id = $1`,
      [id]
    );

    // 3. buat stock movements
    for (const item of items) {
      await createStockMovement(
        {
          item_id: item.item_id,
          movement_type: "adjustment",
          adjustment_direction:
            item.quantity_diff > 0 ? "increase" : "decrease",
          qty: Math.abs(item.quantity_diff),
          reference_type: "stock_adjustment",
          reference_id: id,
          note: `Stock Adjustment ${adj.adjustment_number ?? ""}`,
          created_by: user.id,
          source_location_id: item.quantity_diff < 0 ? item.location_id : null,
          target_location_id: item.quantity_diff > 0 ? item.location_id : null,
        },
        client
      );
    }

    // 4. update status → confirmed
    const { rows: updated } = await client.query(
      `UPDATE inventory.stock_adjustments
       SET status = 'confirmed', updated_at = now()
       WHERE id = $1 RETURNING *`,
      [id]
    );

    await client.query("COMMIT");
    return c.json({ data: { ...updated[0], items } });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Confirm stock adjustment error:", err);
    return c.json({ error: "Failed to confirm stock adjustment" }, 400);
  } finally {
    client.release();
  }
});

/**
 * PATCH /stock-adjustments/:id/cancel - ubah status draft → cancelled
 */
stockAdjustmentRoute.patch("/:id/cancel", async (c) => {
  const id = c.req.param("id");

  try {
    const { rows } = await db.query(
      `UPDATE inventory.stock_adjustments
       SET status = 'cancelled', updated_at = now()
       WHERE id = $1 AND status = 'draft'
       RETURNING *`,
      [id]
    );

    if (rows.length === 0) {
      return c.json(
        {
          error: "Stock adjustment not found or already canceled",
        },
        400
      );
    }

    return c.json({ data: rows[0] });
  } catch (err) {
    console.error("Cancel stock adjustment error:", err);
    return c.json({ error: "Failed to cancel stock adjustment" }, 400);
  }
});
