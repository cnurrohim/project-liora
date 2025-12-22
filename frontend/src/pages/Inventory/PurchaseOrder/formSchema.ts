import { z } from "zod";

export const purchaseOrderSchema = z.object({
  supplier_id: z.uuid("supplier invalid"),
  order_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "order date invalid"),
  expected_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "expected date invalid")
    .optional()
    .nullable(),
  status: z.enum(["draft", "confirmed", "received", "cancelled"]),
  notes: z.string().max(500).optional().nullable(),
  items: z
    .array(
      z.object({
        item_id: z.uuid("item invalid"),
        item_name: z.string().optional(),
        qty: z.number().int().min(1, "required at least 1"),
      })
    )
    .min(1, "required at least 1 item"),
});

export type PurchaseOrderFormValues = z.infer<typeof purchaseOrderSchema>;
