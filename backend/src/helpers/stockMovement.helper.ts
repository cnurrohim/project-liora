// src/helpers/stockMovement.helper.ts
import { db } from "../db.js";

export type MovementType = "inbound" | "outbound" | "adjustment";
export type AdjustmentDirection = "increase" | "decrease";
export type ReferenceType =
  | "purchase_order"
  | "sales_order"
  | "sales_return"
  | "purchase_receive"
  | "purchase_return"
  | "goods_receipt"
  | "stock_opname"
  | "manual_adjustment";

export interface StockMovementPayload {
  item_id: string;
  movement_type: MovementType;
  adjustment_direction: AdjustmentDirection;
  qty: number;
  reference_type: ReferenceType;
  reference_id?: string;
  note?: string;
  created_by: string;
}

/**
 * Buat stock movement otomatis menghitung balance_after
 */
export async function createStockMovement(payload: StockMovementPayload) {
  const client = await db.connect();
  try {
    await client.query("BEGIN");

    // Ambil saldo terakhir
    const lastResult = await client.query(
      `SELECT balance_after FROM logistics.stock_movements
       WHERE item_id=$1 ORDER BY created_at DESC LIMIT 1`,
      [payload.item_id]
    );
    const lastBalance = lastResult.rows[0]?.balance_after ?? 0;

    // Hitung balance_after otomatis
    const balance_after =
      payload.adjustment_direction === "increase"
        ? lastBalance + payload.qty
        : lastBalance - payload.qty;

    // Insert stock movement baru
    const result = await client.query(
      `INSERT INTO logistics.stock_movements
       (id, item_id, movement_type, adjustment_direction, qty, balance_after,
        reference_type, reference_id, note, created_by)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        payload.item_id,
        payload.movement_type,
        payload.adjustment_direction,
        payload.qty,
        balance_after,
        payload.reference_type,
        payload.reference_id ?? null,
        payload.note ?? null,
        payload.created_by,
      ]
    );

    await client.query("COMMIT");
    return result.rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

// Cara pakai helper:

// Dari PO yang diterima
// import { createStockMovement } from "../helpers/stockMovement.helper.js";

// for (const item of purchaseOrderItems) {
//   await createStockMovement({
//     item_id: item.id,
//     movement_type: "inbound",
//     adjustment_direction: "increase",
//     qty: item.received_qty,
//     reference_type: "purchase_order",
//     reference_id: purchaseOrderId,
//     note: "PO diterima",
//     created_by: userId,
//   });
// }

// Dari SO yang dikirim
// for (const item of salesOrderItems) {
//   await createStockMovement({
//     item_id: item.id,
//     movement_type: "outbound",
//     adjustment_direction: "decrease",
//     qty: item.shipped_qty,
//     reference_type: "sales_order",
//     reference_id: salesOrderId,
//     note: "SO dikirim",
//     created_by: userId,
//   });
// }

// Dari stock opname
// await createStockMovement({
//   item_id: itemId,
//   movement_type: "adjustment",
//   adjustment_direction: countedQty > systemQty ? "increase" : "decrease",
//   qty: Math.abs(countedQty - systemQty),
//   reference_type: "stock_opname",
//   reference_id: stockOpnameId,
//   note: "Hasil audit fisik",
//   created_by: userId,
// });
