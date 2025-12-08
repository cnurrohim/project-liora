import { Hono } from "hono";
import { db } from "../../db.js";
import { z } from "zod";
import { authMiddleware } from "../../middleware/auth.js";
import type { Variables } from "../../types/context.js";
import { createStockMovement } from "../../helpers/stockMovement.helper.js";
import { createStockTransfer } from "../../helpers/StockTransfer.helper.js";

export const goodsIssueRoute = new Hono<{ Variables: Variables }>();

goodsIssueRoute.use(authMiddleware);

// schema item Issue
const giItemSchema = z.object({
  item_id: z.uuid(),
  source_location_id: z.uuid(),
  target_location_id: z.uuid().nullable().optional(),
  quantity: z.number().min(1),
  notes: z.string().nullable().optional(),
});

// schema header Issue
const giSchema = z.object({
  issue_date: z.string().optional(),
  notes: z.string().nullable().optional(),
  items: z.array(giItemSchema).min(1),
});

/**
 * POST /goods-issues - create GI + items
 */
goodsIssueRoute.post("/", async (c) => {
  const body = await c.req.json();
  const parsed = giSchema.parse(body);
  const user = c.get("user");

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const giRes = await client.query(
      `INSERT INTO inventory.goods_issues
       (issue_date, notes, created_by)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [
        parsed.issue_date ?? new Date().toISOString().substring(0, 10),
        parsed.notes ?? null,
        user.id,
      ]
    );

    const giId = giRes.rows[0].id;

    for (const item of parsed.items) {
      // 1. insert item GI
      await client.query(
        `INSERT INTO inventory.goods_issue_items
         (goods_issue_id, item_id, source_location_id, target_location_id, quantity, notes)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          giId,
          item.item_id,
          item.source_location_id,
          item.target_location_id ?? null,
          item.quantity,
          item.notes ?? null,
        ]
      );

      // 2. buat stock movement
      if (item.target_location_id) {
        // Transfer antar lokasi
        await createStockTransfer(
          {
            item_id: item.item_id,
            qty: item.quantity,
            reference_type: "transfer",
            reference_id: giId,
            note: `Goods Issue Transfer ${giRes.rows[0].issue_number ?? ""}`,
            created_by: user.id,
            source_location_id: item.source_location_id,
            target_location_id: item.target_location_id,
          },
          client
        );
      } else {
        // Pure outbound (keluar ke customer/eksternal)
        await createStockMovement(
          {
            item_id: item.item_id,
            movement_type: "outbound",
            adjustment_direction: "decrease",
            qty: item.quantity,
            reference_type: "goods_issue",
            reference_id: giId,
            note: `Goods Issue ${giRes.rows[0].issue_number ?? ""}`,
            created_by: user.id,
            source_location_id: item.source_location_id,
            target_location_id: null,
          },
          client
        );
      }
    }

    await client.query("COMMIT");

    return c.json({
      data: { ...giRes.rows[0], items: parsed.items },
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Create GI error:", err);
    return c.json({ error: "Failed to create goods issue" }, 400);
  } finally {
    client.release();
  }
});

/**
 * GET /goods-issues - list semua GI
 */
goodsIssueRoute.get("/", async (c) => {
  const { rows } = await db.query(
    `SELECT gi.*, u.name AS created_by_name
     FROM inventory.goods_issues gi
     JOIN public.users u ON gi.created_by = u.id
     ORDER BY gi.issue_date DESC, gi.created_at DESC`
  );
  return c.json({ data: rows });
});

/**
 * GET /goods-issues/:id/detail - detail GI lengkap
 */
goodsIssueRoute.get("/:id/detail", async (c) => {
  const id = c.req.param("id");

  try {
    const giRes = await db.query(
      `
      SELECT 
        gi.id,
        gi.issue_number,
        gi.issue_date,
        gi.notes,
        u.name AS created_by,

        -- items
        COALESCE(
          json_agg(
            json_build_object(
              'id', gii.id,
              'item_id', gii.item_id,
              'sku', i.sku,
              'item_name', i.name,
              'qty', gii.quantity,
              'source_location', ssl.code || ' ' ||ssl.name,
              'target_location', tsl.code || ' ' ||tsl.name,
              'notes', gii.notes
            )
          ) FILTER (WHERE gii.id IS NOT NULL),
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
                'source_location', sl.code || ' ' || sl.name,
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
            LEFT JOIN inventory.stock_locations sl on sl.id = sm.source_location_id
            LEFT JOIN inventory.stock_locations tl on tl.id = sm.target_location_id
            WHERE (sm.reference_type = 'goods_issue' OR sm.reference_type = 'transfer')
              AND sm.reference_id = gi.id
          ),
          '[]'
        ) AS stock_movements

      FROM inventory.goods_issues gi
      JOIN public.users u ON u.id = gi.created_by
      LEFT JOIN inventory.goods_issue_items gii ON gii.goods_issue_id = gi.id
      LEFT JOIN inventory.stock_locations ssl on ssl.id = gii.source_location_id
      LEFT JOIN inventory.stock_locations tsl on tsl.id = gii.target_location_id
      LEFT JOIN inventory.items i ON i.id = gii.item_id
      WHERE gi.id = $1
      GROUP BY gi.id, u.name
      `,
      [id]
    );

    const gi = giRes.rows[0];
    if (!gi) return c.json({ error: "Goods issue not found" }, 404);

    return c.json({ data: gi });
  } catch (err) {
    console.error("Get goods issue detail error:", err);
    return c.json({ error: "Gagal mengambil detail goods issue" }, 400);
  }
});
