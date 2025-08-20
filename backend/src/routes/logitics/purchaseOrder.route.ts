// src/routes/purchaseOrder.route.ts
import { Hono } from "hono";
import { db } from "../../db.js";
import { z } from "zod";
import { authMiddleware } from "../../middleware/auth.js";
import type { Variables } from "../../types/context.js";
import { createStockMovement } from "../../helpers/stockMovement.helper.js";

export const purchaseOrderRoute = new Hono<{ Variables: Variables }>();

purchaseOrderRoute.use(authMiddleware);

// Schema PO Item
const poItemSchema = z.object({
  item_id: z.uuid(),
  qty: z.number().int().min(1),
  price: z.number().min(0),
});

// Schema PO
const purchaseOrderSchema = z.object({
  supplier_id: z.uuid(),
  order_date: z.string().optional(),
  status: z.enum(["draft", "confirmed", "received", "cancelled"]),
  items: z.array(poItemSchema).min(1),
});

// POST /purchase-orders - create PO + items
purchaseOrderRoute.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const user = c.get("user");
    const parsed = purchaseOrderSchema.parse(body);

    const client = await db.connect();
    try {
      await client.query("BEGIN");

      const poResult = await client.query(
        `INSERT INTO logistics.purchase_orders
         (id, supplier_id, order_date, status, created_by)
         VALUES (gen_random_uuid(), $1, $2, $3, $4)
         RETURNING *`,
        [
          parsed.supplier_id,
          parsed.order_date ?? new Date().toISOString().split("T")[0],
          parsed.status ?? "draft",
          user.id,
        ]
      );

      const poId = poResult.rows[0].id;

      for (const item of parsed.items) {
        await client.query(
          `INSERT INTO logistics.purchase_order_items
           (id, purchase_order_id, item_id, qty, price)
           VALUES (gen_random_uuid(), $1, $2, $3, $4)`,
          [poId, item.item_id, item.qty, item.price]
        );
      }

      await client.query("COMMIT");

      return c.json({ data: { ...poResult.rows[0], items: parsed.items } });
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error("Create PO error:", err);
    if (err instanceof z.ZodError) return c.json({ error: err.flatten }, 400);
    return c.json({ error: "Gagal membuat purchase order" }, 400);
  }
});

// GET /purchase-orders - semua PO
purchaseOrderRoute.get("/", async (c) => {
  const result = await db.query(
    `SELECT po.*, s.name AS supplier_name
     FROM logistics.purchase_orders po
     JOIN logistics.suppliers s ON po.supplier_id = s.id
     ORDER BY po.order_date DESC, po.created_at DESC`
  );
  return c.json({ data: result.rows });
});

// GET /purchase-orders/:id - detail PO
// GET /purchase-orders/:id - detail PO + items
purchaseOrderRoute.get("/:id", async (c) => {
  const id = c.req.param("id");

  try {
    // 1. Ambil header PO
    const poRes = await db.query(
      `SELECT po.*, s.name AS supplier_name
       FROM logistics.purchase_orders po
       JOIN logistics.suppliers s ON po.supplier_id = s.id
       WHERE po.id = $1`,
      [id]
    );

    const po = poRes.rows[0];
    if (!po) return c.json({ error: "Purchase order not found" }, 404);

    // 2. Ambil items PO
    const itemsRes = await db.query(
      `SELECT poi.*, i.sku, i.name AS item_name
       FROM logistics.purchase_order_items poi
       JOIN logistics.items i ON poi.item_id = i.id
       WHERE poi.purchase_order_id = $1 and (poi.qty - poi.received_qty) > 0`,
      [id]
    );

    po.items = itemsRes.rows; // attach items ke object PO

    return c.json({ data: po });
  } catch (err) {
    console.error("Get purchase order detail error:", err);
    return c.json({ error: "Gagal mengambil detail purchase order" }, 400);
  }
});

// GET /purchase-orders/:term/search - cari PO berdasarkan order_number
// backend
purchaseOrderRoute.get("/:term/search", async (c) => {
  const term = c.req.param("term");

  try {
    const { rows } = await db.query(
      `SELECT po.id, po.order_number, s.name AS supplier_name
       FROM logistics.purchase_orders po
       JOIN logistics.suppliers s ON po.supplier_id = s.id
       WHERE po.order_number ILIKE $1 and po.status = 'confirmed'
       ORDER BY po.created_at DESC
       LIMIT 20`,
      [`%${term}%`]
    );

    return c.json({ data: rows });
  } catch (err) {
    console.error("Search purchase order error:", err);
    return c.json({ error: "Gagal mencari purchase order" }, 400);
  }
});

purchaseOrderRoute.get("/:id/detail", async (c) => {
  const id = c.req.param("id");

  try {
    // Ambil header + supplier
    const poRes = await db.query(
      `
      SELECT 
        po.id,
        po.order_number,
        po.order_date,
        po.expected_date,
        po.status,
        po.supplier_id,
        s.name AS supplier_name,

        -- items
        COALESCE(
          json_agg(
            json_build_object(
              'id', poi.id,
              'item_id', poi.item_id,
              'sku', i.sku,
              'item_name', i.name,
              'qty', poi.qty,
              'price', poi.price
            )
          ) FILTER (WHERE poi.id IS NOT NULL),
          '[]'
        ) AS items,

        -- receives
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', pr.id,
                'receive_date', pr.receive_date,
                'received_by', u2.name,
                'note', pr.note,
                'items', COALESCE(
                  (
                    SELECT json_agg(
                      json_build_object(
                        'id', pri.id,
                        'item_id', pri.item_id,
                        'sku', i2.sku,
                        'item_name', i2.name,
                        'qty', pri.qty
                      )
                    ) 
                    FROM logistics.purchase_receive_items pri
                    JOIN logistics.items i2 ON i2.id = pri.item_id
                    WHERE pri.purchase_receive_id = pr.id
                  ), '[]'
                )
              )
            )
            FROM logistics.purchase_receives pr
            JOIN public.users u2 ON u2.id = pr.received_by
            WHERE pr.purchase_order_id = po.id
          ),
          '[]'
        ) AS receives,

        -- stock movements
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', sm.id,
                'item_id', sm.item_id,
                'sku', i3.sku,
                'item_name', i3.name,
                'movement_type', sm.movement_type,
                'adjustment_direction', sm.adjustment_direction,
                'qty', sm.qty,
                'balance_after', sm.balance_after,
                'reference_id', sm.reference_id,
                'reference_type', sm.reference_type,
                'note', sm.note,
                'created_at', sm.created_at,
                'created_by', sm.created_by
              ) ORDER BY sm.created_at
            )
            FROM logistics.stock_movements sm
            JOIN logistics.items i3 ON i3.id = sm.item_id
            WHERE sm.reference_type = 'purchase_receive'
              AND sm.reference_id IN (
                SELECT id FROM logistics.purchase_receives WHERE purchase_order_id = po.id
              )
          ),
          '[]'
        ) AS stock_movements

      FROM logistics.purchase_orders po
      JOIN logistics.suppliers s ON s.id = po.supplier_id
      LEFT JOIN logistics.purchase_order_items poi ON poi.purchase_order_id = po.id
      LEFT JOIN logistics.items i ON i.id = poi.item_id
      WHERE po.id = $1
      GROUP BY po.id, s.name
      `,
      [id]
    );

    const po = poRes.rows[0];
    if (!po) return c.json({ error: "Purchase order not found" }, 404);

    return c.json({ data: po });
  } catch (err) {
    console.error("Get purchase order detail error:", err);
    return c.json({ error: "Gagal mengambil detail purchase order" }, 400);
  }
});

purchaseOrderRoute.put("/:id/approve", async (c) => {
  const id = c.req.param("id");
  const user = c.get("user");
  try {
    const result = await db.query(
      "UPDATE logistics.purchase_orders SET status = 'confirmed', approved_by=$1, approved_at=$2 WHERE id=$3 AND status = 'draft' RETURNING *",
      [user.id, new Date().toISOString(), id]
    );
    if (!result.rows.length)
      return c.json(
        { error: "Purchase order not found or already approved" },
        404
      );
    return c.json({ data: result.rows[0] });
  } catch (err) {
    console.error("approve purchase order error:", err);
    return c.json({ error: "Gagal menyetujui purchase order" }, 400);
  }
});

purchaseOrderRoute.put("/:id/cancel", async (c) => {
  const id = c.req.param("id");
  const user = c.get("user");
  try {
    const result = await db.query(
      "UPDATE logistics.purchase_orders SET status = 'cancelled' WHERE id=$1 AND status = 'confirmed' RETURNING *",
      [id]
    );
    if (!result.rows.length)
      return c.json(
        { error: "Purchase order not found or already received" },
        404
      );
    return c.json({ data: result.rows[0] });
  } catch (err) {
    console.error("cancel purchase order error:", err);
    return c.json({ error: "Gagal membatalkan purchase order" }, 400);
  }
});

// DELETE /purchase-orders/:id - hapus PO
purchaseOrderRoute.delete("/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const result = await db.query(
      "DELETE FROM logistics.purchase_orders WHERE id=$1 RETURNING *",
      [id]
    );
    if (!result.rows.length)
      return c.json({ error: "Purchase order not found" }, 404);
    return c.json({ data: result.rows[0] });
  } catch (err) {
    console.error("Delete purchase order error:", err);
    return c.json({ error: "Gagal menghapus purchase order" }, 400);
  }
});

// POST /purchase-orders/:id/receive
purchaseOrderRoute.post("/:id/receive", async (c) => {
  const id = c.req.param("id"); // PO ID
  const user = c.get("user");
  const body = await c.req.json();

  const schema = z.object({
    receive_date: z.string().optional(),
    note: z.string().optional(),
    items: z
      .array(
        z.object({
          item_id: z.string().uuid(),
          qty: z.number().min(1),
        })
      )
      .min(1),
  });

  const parsed = schema.parse(body);

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const poRes = await client.query(
      `SELECT order_number FROM logistics.purchase_orders WHERE id=$1`,
      [id]
    );
    const orderNumber = poRes.rows[0].order_number;

    // 1. Insert ke purchase_receives
    const receiveRes = await client.query(
      `INSERT INTO logistics.purchase_receives
       (purchase_order_id, receive_date, received_by, note)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        id,
        parsed.receive_date ?? new Date().toISOString().substring(0, 10),
        user.id,
        parsed.note ?? null,
      ]
    );
    const receiveId = receiveRes.rows[0].id;

    // 2. Insert detail items
    for (const item of parsed.items) {
      await client.query(
        `INSERT INTO logistics.purchase_receive_items
         (purchase_receive_id, item_id, qty)
         VALUES ($1, $2, $3)`,
        [receiveId, item.item_id, item.qty]
      );

      // Update received_qty di purchase_order_items
      await client.query(
        `UPDATE logistics.purchase_order_items
         SET received_qty = received_qty + $1
         WHERE purchase_order_id = $2 AND item_id = $3`,
        [item.qty, id, item.item_id]
      );

      // Buat stock movement (inbound)
      // asumsi kita sudah punya helper createStockMovement
      await createStockMovement({
        item_id: item.item_id,
        movement_type: "inbound",
        adjustment_direction: "increase",
        qty: item.qty,
        reference_type: "purchase_receive",
        reference_id: receiveId,
        note: `Receive PO ${orderNumber}`,
        created_by: user.id,
      });
    }

    // 3. Cek apakah semua item sudah fully received
    const poCheck = await client.query(
      `SELECT SUM(qty) AS total_ordered, SUM(received_qty) AS total_received
       FROM logistics.purchase_order_items
       WHERE purchase_order_id=$1`,
      [id]
    );
    const { total_ordered, total_received } = poCheck.rows[0];
    if (Number(total_ordered) <= Number(total_received)) {
      await client.query(
        `UPDATE logistics.purchase_orders SET status='received' WHERE id=$1`,
        [id]
      );
    }

    await client.query("COMMIT");

    return c.json({ data: { ...receiveRes.rows[0], items: parsed.items } });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Receive PO error:", err);
    return c.json({ error: "Gagal membuat purchase receive" }, 400);
  } finally {
    client.release();
  }
});
