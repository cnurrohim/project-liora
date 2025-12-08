import { z } from "zod";

export const issueSchema = z.object({
  issue_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid issue date"),
  reference: z.string().max(100).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
  items: z
    .array(
      z
        .object({
          item_id: z.uuid("Invalid item ID"),
          item_name: z.string().optional(),
          source_location_id: z.uuid("Source location is required"),
          source_location_name: z.string().optional(),
          target_location_id: z
            .uuid("Invalid target location")
            .optional()
            .nullable()
            .or(z.literal(null)),
          target_location_name: z.string().optional(),
          quantity: z
            .number()
            .min(1, "Minimum quantity is 1")
            .refine((val) => Number.isInteger(val), {
              message: "Quantity must be an integer",
            }),
          max_qty: z.number().refine((val) => Number.isInteger(val), {
            message: "Max Qty must be an integer",
          }),
          notes: z.string().max(255).optional().nullable(),
        })
        .refine((data) => data.quantity <= data.max_qty, {
          message: "Quantity cannot exceed Max Qty",
          path: ["quantity"],
        })
    )
    .min(1, "At least 1 item is required"),
});

export type IssueFormValues = z.infer<typeof issueSchema>;
