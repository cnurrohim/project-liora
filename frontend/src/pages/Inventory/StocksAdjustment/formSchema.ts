import { z } from "zod";

export const stockAdjustmentSchema = z.object({
  adjustment_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "adjustment date invalid"),
  reason: z.string().max(500, "reason too long").optional().nullable(),
  status: z.enum(["draft", "confirmed"]),
  items: z
    .array(
      z
        .object({
          item_id: z.uuid("item invalid"),
          item_name: z.string().optional(),
          location_id: z.uuid("location invalid"),
          location_name: z.string().optional(),
          quantity_diff: z.coerce
            .number<number>()
            .refine((val) => val !== null && val !== 0, {
              message: "Change qty cannot be 0 or empty",
            }),
          quantity_before: z.number().refine((val) => Number.isInteger(val), {
            message: "The amount must be a whole number",
          }),
          notes: z.string().max(500).optional().nullable(),
        })
        .refine(
          (data) => {
            return data.quantity_before + data.quantity_diff >= 0;
          },
          {
            message: "Ending stock cannot be negative.",
            path: ["quantity_diff"],
          }
        )
    )
    .min(1, "at least 1 item adjustment"),
});

export type StockAdjustmentFormValues = z.infer<typeof stockAdjustmentSchema>;
