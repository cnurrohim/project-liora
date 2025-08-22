import type { PoolClient } from "pg";
import { db } from "../db.js";
import {
  createStockMovement,
  type StockMovementPayload,
} from "./stockMovement.helper.js";

interface StockTransferPayload {
  item_id: string;
  qty: number;
  reference_type: "transfer";
  reference_id?: string;
  note?: string;
  created_by: string;
  source_location_id: string;
  target_location_id: string;
}

/**
 * Transfer stok antar lokasi → otomatis buat 2 movement (outbound + inbound)
 */
export async function createStockTransfer(
  payload: StockTransferPayload,
  client?: PoolClient
) {
  const localClient = client ?? (await db.connect());
  let mustRelease = !client;

  try {
    // 1️⃣ Outbound dari lokasi asal
    const outboundPayload: StockMovementPayload = {
      item_id: payload.item_id,
      movement_type: "outbound",
      adjustment_direction: "decrease",
      qty: payload.qty,
      reference_type: "transfer",
      reference_id: payload.reference_id,
      note: payload.note ?? `Transfer OUT to ${payload.target_location_id}`,
      created_by: payload.created_by,
      source_location_id: payload.source_location_id,
      target_location_id: null,
    };
    const outbound = await createStockMovement(outboundPayload, client);

    // 2️⃣ Inbound ke lokasi tujuan
    const inboundPayload: StockMovementPayload = {
      item_id: payload.item_id,
      movement_type: "inbound",
      adjustment_direction: "increase",
      qty: payload.qty,
      reference_type: "transfer",
      reference_id: payload.reference_id,
      note: payload.note ?? `Transfer IN from ${payload.source_location_id}`,
      created_by: payload.created_by,
      source_location_id: null,
      target_location_id: payload.target_location_id,
    };
    const inbound = await createStockMovement(inboundPayload, client);

    return { outbound, inbound };
  } catch (err) {
    throw err;
  } finally {
    if (mustRelease) {
      localClient.release();
    }
  }
}

// await createStockTransfer({
//   item_id: "item-uuid",
//   qty: 50,
//   reference_type: "transfer",
//   reference_id: "doc-uuid",
//   created_by: "user-uuid",
//   source_location_id: "loc-gudangA",
//   target_location_id: "loc-gudangB",
// });
