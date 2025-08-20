// src/schema/purchaseOrder.schema.ts
import { z } from "zod";

export const purchaseOrderSchema = z.object({
  supplier_id: z.string().uuid("ID supplier tidak valid"),
  order_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal order tidak valid"),
  expected_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal perkiraan tidak valid")
    .optional()
    .nullable(),
  status: z.enum(["draft", "confirmed", "received", "cancelled"]),
  notes: z.string().max(500).optional().nullable(),
  items: z
    .array(
      z.object({
        item_id: z.string().uuid("ID item tidak valid"),
        qty: z.number().int().min(1, "Qty minimal 1"),
        price: z.number().min(0, "Harga tidak boleh negatif"),
      })
    )
    .min(1, "Minimal 1 item"),
});

export type PurchaseOrderFormValues = z.infer<typeof purchaseOrderSchema>;
