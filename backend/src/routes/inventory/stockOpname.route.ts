import { Hono } from "hono";
import { db } from "../../db.js";
import { z } from "zod";
import { authMiddleware } from "../../middleware/auth.js";
import type { Variables } from "../../types/context.js";
import { createStockMovement } from "../../helpers/stockMovement.helper.js";

export const stockOpnameRoute = new Hono<{ Variables: Variables }>();

stockOpnameRoute.use(authMiddleware);

// schema item Opname
const opnameItemSchema = z.object({
  item_id: z.uuid(),
  quantity_system: z.number(),
  quantity_counted: z.number(),
});

// schema header Opname
const opnameSchema = z.object({
  location_id: z.uuid(),
  opname_date: z.string().optional(),
  status: z.string(),
  notes: z.string().nullable().optional(),
  review_note: z.string().nullable().optional(),
  items: z.array(opnameItemSchema).min(1),
});

/**
 * POST /stock-opnames - create opname (draft) + items
 */
stockOpnameRoute.post("/", async (c) => {
  const body = await c.req.json();
  const parsed = opnameSchema.parse(body);
  const user = c.get("user");

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const opnameRes = await client.query(
      `INSERT INTO inventory.stock_opnames
       (location_id, opname_date, status, notes, created_by)
       VALUES ($1, $2, 'draft', $3, $4)
       RETURNING *`,
      [
        parsed.location_id,
        parsed.opname_date ?? new Date().toISOString().substring(0, 10),
        parsed.notes ?? null,
        user.id,
      ]
    );

    const opnameId = opnameRes.rows[0].id;

    for (const item of parsed.items) {
      await client.query(
        `INSERT INTO inventory.stock_opname_items
         (opname_id, item_id, quantity_system, quantity_counted)
         VALUES ($1, $2, $3, $4)`,
        [opnameId, item.item_id, item.quantity_system, item.quantity_counted]
      );
    }

    await client.query("COMMIT");
    return c.json({
      data: { ...opnameRes.rows[0], items: parsed.items },
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Create Stock Opname error:", err);
    return c.json({ error: "Failed to create stock opname" }, 400);
  } finally {
    client.release();
  }
});

// GET /stock-opname/:id - detail SO + items
stockOpnameRoute.get("/:id", async (c) => {
  const id = c.req.param("id");

  try {
    const soRes = await db.query(
      `SELECT so.*, u.name AS created_by, l.name as location_name
        FROM inventory.stock_opnames so
        JOIN public.users u ON so.created_by = u.id
        JOIN inventory.stock_locations l ON l.id = so.location_id
       WHERE so.id = $1`,
      [id]
    );

    const so = soRes.rows[0];
    if (!so) return c.json({ error: "Stock opname not found" }, 404);

    const itemsRes = await db.query(
      `SELECT soi.*, i.sku, i.sku || ' - ' || i.name  || ', qty:  ' || sb.qty AS item_name
       FROM inventory.stock_opname_items soi
       JOIN inventory.items i ON soi.item_id = i.id
       JOIN inventory.stock_opnames so ON so.id = soi.opname_id
       LEFT JOIN inventory.stock_balances sb ON sb.item_id = soi.item_id and sb.location_id = so.location_id
       WHERE soi.opname_id = $1`,
      [id]
    );

    so.items = itemsRes.rows;
    return c.json({ data: so });
  } catch (err) {
    console.error("Get stock opname detail error:", err);
    return c.json({ error: "Failed to get stock opname detail" }, 400);
  }
});

/**
 * GET /stock-opnames - list all opnames
 */
stockOpnameRoute.get("/", async (c) => {
  const { rows } = await db.query(
    `SELECT so.*, u.name AS created_by
     FROM inventory.stock_opnames so
     JOIN public.users u ON so.created_by = u.id
     ORDER BY so.opname_date DESC`
  );
  return c.json({ data: rows });
});

/**
 * GET /stock-opnames/:id/detail - detail opname + items + movements
 */
stockOpnameRoute.get("/:id/detail", async (c) => {
  const id = c.req.param("id");

  try {
    const { rows } = await db.query(
      `
      SELECT 
        so.id,
        so.opname_number,
        so.opname_date,
        so.status,
        so.updated_at,
        so.reviewed_at,
        so.finalized_at,
        so.canceled_at,
        so.review_note,
        so.notes,
        u.name AS created_by,
        uu.name AS updated_by,
        uf.name AS finalized_by,
        uc.name AS canceled_by,
        ur.name AS reviewed_by,
        sl.code || ' ' || sl.name AS location,

        COALESCE(
          json_agg(
            json_build_object(
              'id', soi.id,
              'item_id', soi.item_id,
              'sku', i.sku,
              'item_name', i.name,
              'quantity_system', soi.quantity_system,
              'quantity_counted', soi.quantity_counted
            )
          ) FILTER (WHERE soi.id IS NOT NULL),
          '[]'
        ) AS items,

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
                'target_location', slt.code || ' ' || slt.name,
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
            LEFT JOIN inventory.stock_locations slt ON slt.id = sm.target_location_id
            WHERE sm.reference_type = 'stock_opname'
              AND sm.reference_id = so.id
          ),
          '[]'
        ) AS stock_movements

      FROM inventory.stock_opnames so
      JOIN public.users u ON u.id = so.created_by
      LEFT JOIN public.users uu ON uu.id = so.created_by
      LEFT JOIN public.users ur ON ur.id = so.reviewed_by
      LEFT JOIN public.users uf ON uf.id = so.finalized_by
      LEFT JOIN public.users uc ON uc.id = so.canceled_by
      LEFT JOIN inventory.stock_opname_items soi ON soi.opname_id = so.id
      LEFT JOIN inventory.items i ON i.id = soi.item_id
      LEFT JOIN inventory.stock_locations sl ON sl.id = so.location_id
      WHERE so.id = $1
      GROUP BY so.id, u.name, uu.name, uf.name, uc.name, ur.name, sl.code, sl.name
      `,
      [id]
    );

    if (!rows.length) return c.json({ error: "Stock opname not found" }, 404);
    return c.json({ data: rows[0] });
  } catch (err) {
    console.error("Get stock opname detail error:", err);
    return c.json({ error: "Failed to get stock opname detail" }, 400);
  }
});

/**
 * PATCH /stock-opnames/:id/finalize - finalize opname → create stock adjustment movements
 */
stockOpnameRoute.patch("/:id/finalize", async (c) => {
  const id = c.req.param("id");
  const user = c.get("user");
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const { rows: opnameRows } = await client.query(
      `SELECT * FROM inventory.stock_opnames
       WHERE id = $1 AND status IN ('reviewed')`,
      [id]
    );
    if (opnameRows.length === 0) {
      await client.query("ROLLBACK");
      return c.json(
        { error: "Stock opname not found or already finalized" },
        400
      );
    }
    const opname = opnameRows[0];

    const { rows: items } = await client.query(
      `SELECT * FROM inventory.stock_opname_items
       WHERE opname_id = $1`,
      [id]
    );

    for (const item of items) {
      const diff = item.quantity_counted - item.quantity_system;
      if (diff === 0) continue;

      await createStockMovement(
        {
          item_id: item.item_id,
          movement_type: "adjustment",
          adjustment_direction: diff > 0 ? "increase" : "decrease",
          qty: Math.abs(diff),
          reference_type: "stock_opname",
          reference_id: id,
          note: `Stock Opname ${opname.opname_number ?? ""}`,
          created_by: user.id,
          target_location_id: diff > 0 ? opname.location_id : null,
          source_location_id: diff < 0 ? opname.location_id : null,
        },
        client
      );
    }

    const { rows: updated } = await client.query(
      `UPDATE inventory.stock_opnames
       SET status = 'finalized', finalized_by = $2, finalized_at = now()
       WHERE id = $1
       RETURNING *`,
      [id, user.id]
    );

    await client.query("COMMIT");
    return c.json({ data: { ...updated[0], items } });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Finalize stock opname error:", err);
    return c.json({ error: "Failed to finalize stock opname" }, 400);
  } finally {
    client.release();
  }
});

/**
 * PATCH /stock-opnames/:id/cancel - cancel opname
 */
stockOpnameRoute.patch("/:id/cancel", async (c) => {
  const id = c.req.param("id");
  const user = c.get("user");
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const { rows: opnameRows } = await client.query(
      `SELECT * FROM inventory.stock_opnames
       WHERE id = $1 AND status IN ('draft','reviewed')`,
      [id]
    );
    if (opnameRows.length === 0) {
      await client.query("ROLLBACK");
      return c.json(
        { error: "Stock opname not found or already finalized" },
        400
      );
    }

    const { rows: updated } = await client.query(
      `UPDATE inventory.stock_opnames
       SET status = 'canceled', canceled_by = $2, canceled_at = now()
       WHERE id = $1
       RETURNING *`,
      [id, user.id]
    );

    await client.query("COMMIT");
    return c.json({ data: { ...updated[0] } });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Cancel stock opname error:", err);
    return c.json({ error: "Failed to cancel stock opname" }, 400);
  } finally {
    client.release();
  }
});

/**
 * PATCH /stock-opnames/:id - update opname (draft/reviewed) + items
 */
stockOpnameRoute.patch("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const parsed = opnameSchema.parse(body);
  const user = c.get("user");

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const statusRes = await client.query(
      `SELECT status FROM inventory.stock_opnames
       WHERE id=$1`,
      [id]
    );
    if (statusRes.rowCount === 0) {
      throw new Error("Stock opname not found");
    }

    const currentStatus = statusRes.rows[0].status;
    if (!["draft", "reviewed"].includes(currentStatus)) {
      throw new Error("Stock opname can no longer be edited");
    }

    let opnameRes;
    if (parsed.status === "reviewed") {
      opnameRes = await client.query(
        `UPDATE inventory.stock_opnames
         SET review_note = $1,
             reviewed_by = $2,
             reviewed_at = now(),
             status = 'reviewed'
         WHERE id = $3 AND status IN ('draft','reviewed')
         RETURNING *`,
        [parsed.review_note ?? null, user.id, id]
      );
    } else {
      opnameRes = await client.query(
        `UPDATE inventory.stock_opnames
         SET location_id = $1,
             opname_date = $2,
             notes = $3,
             updated_by = $4,
             updated_at = now()
         WHERE id = $5 AND status IN ('draft','reviewed')
         RETURNING *`,
        [
          parsed.location_id,
          parsed.opname_date ?? new Date().toISOString().substring(0, 10),
          parsed.notes ?? null,
          user.id,
          id,
        ]
      );

      // Hapus + insert ulang items
      await client.query(
        `DELETE FROM inventory.stock_opname_items WHERE opname_id = $1`,
        [id]
      );

      for (const item of parsed.items) {
        await client.query(
          `INSERT INTO inventory.stock_opname_items
           (opname_id, item_id, quantity_system, quantity_counted)
           VALUES ($1, $2, $3, $4)`,
          [id, item.item_id, item.quantity_system, item.quantity_counted]
        );
      }
    }

    if (opnameRes.rowCount === 0) {
      throw new Error("Failed to update stock opname");
    }

    await client.query("COMMIT");
    return c.json({
      data: { ...opnameRes.rows[0], items: parsed.items ?? [] },
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Update Stock Opname error:", err);
    return c.json({ error: "Failed to update stock opname" }, 400);
  } finally {
    client.release();
  }
});

/**
 * DELETE /stock-opnames/:id - soft delete
 */
stockOpnameRoute.delete("/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const result = await db.query(
      `UPDATE inventory.stock_opnames
       SET deleted_at = now()
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING *`,
      [id]
    );
    if (!result.rows.length)
      return c.json({ error: "Stock opname not found" }, 404);
    return c.json({ data: result.rows[0] });
  } catch (err) {
    console.error("Soft delete stock opname error:", err);
    return c.json({ error: "Failed to delete stock opname" }, 400);
  }
});
