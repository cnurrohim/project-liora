// stockMovement.helper.ts
import type { PoolClient } from "pg";
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
  | "manual_adjustment"
  | "goods_issue"
  | "transfer";

export interface StockMovementPayload {
  item_id: string;
  movement_type: MovementType;
  adjustment_direction: AdjustmentDirection;
  qty: number;
  reference_type: ReferenceType;
  reference_id?: string;
  note?: string;
  created_by: string;
  source_location_id?: string | null;
  target_location_id?: string | null;
}

export async function createStockMovement(
  payload: StockMovementPayload,
  client?: PoolClient
) {
  const localClient = client ?? (await db.connect());
  let mustRelease = !client;

  try {
    // Tentukan lokasi yang kena efek stok
    let locationId: string | null = null;
    if (payload.movement_type === "inbound") {
      locationId = payload.target_location_id ?? null;
    } else if (payload.movement_type === "outbound") {
      locationId = payload.source_location_id ?? null;
    } else {
      locationId =
        payload.target_location_id ?? payload.source_location_id ?? null;
    }

    if (!locationId) {
      throw new Error("location_id wajib diisi untuk movement ini");
    }

    // Ambil saldo terakhir dari stock_balances
    const balResult = await localClient.query(
      `SELECT qty FROM logistics.stock_balances
       WHERE item_id = $1 AND location_id = $2`,
      [payload.item_id, locationId]
    );
    const currentBalance = balResult.rows[0]?.qty ?? 0;

    // Hitung saldo baru
    const balance_after =
      payload.adjustment_direction === "increase"
        ? currentBalance + payload.qty
        : currentBalance - payload.qty;

    if (balance_after < 0) {
      throw new Error("Stock tidak mencukupi!");
    }

    // Update / Insert ke stock_balances
    await localClient.query(
      `INSERT INTO logistics.stock_balances (item_id, location_id, qty)
       VALUES ($1, $2, $3)
       ON CONFLICT (item_id, location_id)
       DO UPDATE SET qty = EXCLUDED.qty`,
      [payload.item_id, locationId, balance_after]
    );

    // Insert ke stock_movements
    const result = await localClient.query(
      `INSERT INTO logistics.stock_movements
       (id, item_id, source_location_id, target_location_id,
        movement_type, adjustment_direction, qty, balance_after,
        reference_type, reference_id, note, created_by)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        payload.item_id,
        payload.source_location_id ?? null,
        payload.target_location_id ?? null,
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

    return result.rows[0];
  } finally {
    if (mustRelease) {
      localClient.release();
    }
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
