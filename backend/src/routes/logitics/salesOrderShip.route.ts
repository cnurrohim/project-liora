import { Hono } from "hono";
import { db } from "../../db.js";
import { createStockMovement } from "../../helpers/stockMovement.helper.js";

export const soShipRoute = new Hono();

/**
 * POST /sales-orders/:id/ship
 * Kirim barang untuk SO, otomatis create stock_movements
 * Body: { shipped_items: [{ item_id, shipped_qty }] , created_by }
 */
soShipRoute.post("/:id/ship", async (c) => {
  const soId = c.req.param("id");
  const body = await c.req.json();

  const { shipped_items, created_by } = body;

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    // Update SO status menjadi 'shipped'
    await client.query(
      `UPDATE logistics.sales_orders
       SET status='shipped', updated_at=NOW()
       WHERE id=$1`,
      [soId]
    );

    // Loop tiap item SO
    for (const item of shipped_items) {
      // Update shipped_qty di SO item
      await client.query(
        `UPDATE logistics.sales_order_items
         SET shipped_qty = shipped_qty + $1
         WHERE sales_order_id = $2 AND item_id = $3`,
        [item.shipped_qty, soId, item.item_id]
      );

      // Buat stock movement outbound otomatis
      await createStockMovement({
        item_id: item.item_id,
        movement_type: "outbound",
        adjustment_direction: "decrease",
        qty: item.shipped_qty,
        reference_type: "sales_order",
        reference_id: soId,
        note: "SO dikirim",
        created_by,
      });
    }

    await client.query("COMMIT");
    return c.json({ message: "SO dikirim dan stock movement dibuat" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("SO ship error:", err);
    return c.json({ error: "Gagal mengirim SO" }, 400);
  } finally {
    client.release();
  }
});
