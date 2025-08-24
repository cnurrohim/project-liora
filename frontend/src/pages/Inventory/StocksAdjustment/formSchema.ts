// src/schema/stockAdjustment.schema.ts
import { z } from "zod";

export const stockAdjustmentSchema = z.object({
  adjustment_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal adjustment tidak valid"),
  reason: z.string().max(500, "Alasan terlalu panjang").optional().nullable(),
  status: z.enum(["draft", "confirmed"]),
  items: z
    .array(
      z
        .object({
          item_id: z.uuid("ID item tidak valid"),
          item_name: z.string().optional(),
          location_id: z.uuid("ID lokasi tidak valid"),
          location_name: z.string().optional(),
          quantity_diff: z.coerce
            .number<number>()
            .refine((val) => val !== null && val !== 0, {
              message: "Perubahan qty tidak boleh 0 atau kosong",
            }),
          quantity_before: z.number().refine((val) => Number.isInteger(val), {
            message: "Jumlah harus berupa bilangan bulat",
          }),
          notes: z.string().max(500).optional().nullable(),
        })
        .refine(
          (data) => {
            return data.quantity_before + data.quantity_diff >= 0;
          },
          {
            message: "Stok akhir tidak boleh negatif",
            path: ["quantity_diff"],
          }
        )
    )
    .min(1, "Minimal 1 item adjustment"),
});

export type StockAdjustmentFormValues = z.infer<typeof stockAdjustmentSchema>;
