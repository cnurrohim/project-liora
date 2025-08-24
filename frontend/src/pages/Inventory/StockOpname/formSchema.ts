// src/schema/stockOpname.schema.ts
import { z } from "zod";

export const stockOpnameSchema = z.object({
  location_id: z.uuid("Lokasi tidak valid"),
  location_name: z.string().optional(),
  opname_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal opname tidak valid"),
  status: z.enum(["draft", "reviewed", "finalized", "canceled"]),
  notes: z.string().max(1000, "Catatan terlalu panjang").optional().nullable(),
  review_note: z
    .string()
    .max(1000, "Catatan terlalu panjang")
    .optional()
    .nullable(),
  items: z
    .array(
      z.object({
        item_id: z.uuid("ID item tidak valid"),
        item_name: z.string().optional(),
        quantity_system: z.coerce
          .number<number>()
          .nonnegative("Qty system tidak boleh negatif"),
        quantity_counted: z.coerce
          .number<number>()
          .nonnegative("Qty hasil hitung tidak boleh negatif"),
      })
    )
    .min(1, "Minimal 1 item opname"),
});

export type StockOpnameFormValues = z.infer<typeof stockOpnameSchema>;
