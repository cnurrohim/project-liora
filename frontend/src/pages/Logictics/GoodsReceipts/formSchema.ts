import { z } from "zod";

export const goodsReceiptSchema = z.object({
  supplier_id: z.uuid("ID supplier tidak valid"),
  receipt_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal penerimaan tidak valid"),
  notes: z.string().max(500).optional().nullable(),
  items: z
    .array(
      z.object({
        item_id: z.uuid("ID item tidak valid"),
        quantity: z
          .number()
          .min(1, "Jumlah minimal 1")
          .refine((val) => Number.isInteger(val), {
            message: "Jumlah harus berupa bilangan bulat",
          }),
        notes: z.string().max(255).optional().nullable(),
      })
    )
    .min(1, "Minimal 1 item"),
});

export type GoodsReceiptFormValues = z.infer<typeof goodsReceiptSchema>;
