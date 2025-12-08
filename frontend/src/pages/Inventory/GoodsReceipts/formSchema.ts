import { z } from "zod";

export const goodsReceiptSchema = z.object({
  supplier_id: z.uuid("ID supplier tidak valid"),
  location_id: z.uuid("stored location tidak valid"),
  receipt_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Received date invalid"),
  notes: z.string().max(500).optional().nullable(),
  items: z
    .array(
      z.object({
        item_id: z.uuid("Item invalid"),
        item_name: z.string().optional(),
        quantity: z
          .number()
          .min(1, "required at least 1")
          .refine((val) => Number.isInteger(val), {
            message: "qty is invalid",
          }),
        notes: z.string().max(255).optional().nullable(),
      })
    )
    .min(1, "required at least an item "),
});

export type GoodsReceiptFormValues = z.infer<typeof goodsReceiptSchema>;
