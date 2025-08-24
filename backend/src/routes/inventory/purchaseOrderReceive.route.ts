import { Hono } from "hono";
import { db } from "../../db.js";
import { createStockMovement } from "../../helpers/stockMovement.helper.js";

export const poReceiveRoute = new Hono();

/**
 * POST /purchase-orders/:id/receive
 * Terima barang dari PO, otomatis create stock_movements
 * Body: { received_items: [{ item_id, received_qty }] , created_by }
 */
poReceiveRoute.post("/:id/receive", async (c) => {
  const poId = c.req.param("id");
  const body = await c.req.json();

  const { received_items, created_by } = body;

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    // Update PO status menjadi 'received'
    await client.query(
      `UPDATE inventory.purchase_orders
       SET status='received', updated_at=NOW()
       WHERE id=$1`,
      [poId]
    );

    // Loop tiap item PO
    for (const item of received_items) {
      // Update received_qty di PO item
      await client.query(
        `UPDATE inventory.purchase_order_items
         SET received_qty = received_qty + $1
         WHERE purchase_order_id = $2 AND item_id = $3`,
        [item.received_qty, poId, item.item_id]
      );

      // Buat stock movement inbound otomatis
      await createStockMovement({
        item_id: item.item_id,
        movement_type: "inbound",
        adjustment_direction: "increase",
        qty: item.received_qty,
        reference_type: "purchase_order",
        reference_id: poId,
        note: "PO diterima",
        created_by,
      });
    }

    await client.query("COMMIT");
    return c.json({ message: "PO diterima dan stock movement dibuat" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("PO receive error:", err);
    return c.json({ error: "Gagal menerima PO" }, 400);
  } finally {
    client.release();
  }
});
