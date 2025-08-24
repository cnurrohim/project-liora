import { z } from "zod";

export const issueSchema = z.object({
  issue_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal issue tidak valid"),
  reference: z.string().max(100).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
  items: z
    .array(
      z
        .object({
          item_id: z.uuid("ID item tidak valid"),
          item_name: z.string().optional(), // << Tambahkan ini
          source_location_id: z.uuid("Lokasi asal wajib dipilih"),
          source_location_name: z.string().optional(), // << Tambahkan ini
          target_location_id: z
            .uuid("lokasi tidak valid")
            .optional()
            .nullable()
            .or(z.literal(null)),
          target_location_name: z.string().optional(), // << Tambahkan ini
          quantity: z
            .number()
            .min(1, "Jumlah minimal 1")
            .refine((val) => Number.isInteger(val), {
              message: "Jumlah harus berupa bilangan bulat",
            }),
          max_qty: z.number().refine((val) => Number.isInteger(val), {
            message: "Jumlah harus berupa bilangan bulat",
          }),
          notes: z.string().max(255).optional().nullable(),
        })
        .refine((data) => data.quantity <= data.max_qty, {
          message: "Qty tidak boleh melebihi Max Qty",
          path: ["quantity"], // supaya error tampil di field quantity
        })
    )
    .min(1, "Minimal 1 item"),
});

export type IssueFormValues = z.infer<typeof issueSchema>;
