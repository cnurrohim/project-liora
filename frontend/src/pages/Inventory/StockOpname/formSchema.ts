import { z } from "zod";

export const stockOpnameSchema = z.object({
  location_id: z.uuid("Lokasi tidak valid"),
  location_name: z.string().optional(),
  opname_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "opname date invalid"),
  status: z.enum(["draft", "reviewed", "finalized", "canceled"]),
  notes: z.string().max(1000, "notes too long").optional().nullable(),
  review_note: z.string().max(1000, "notes too long").optional().nullable(),
  items: z
    .array(
      z.object({
        item_id: z.uuid("item invalid"),
        item_name: z.string().optional(),
        quantity_system: z.coerce
          .number<number>()
          .nonnegative("qty can not less then 0"),
        quantity_counted: z.coerce
          .number<number>()
          .nonnegative("qty can not less then 0"),
      })
    )
    .min(1, "Minimal 1 item opname"),
});

export type StockOpnameFormValues = z.infer<typeof stockOpnameSchema>;
