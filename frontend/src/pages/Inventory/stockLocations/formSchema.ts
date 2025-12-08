import { z } from "zod";

export const stockLocationsSchema = z.object({
  code: z.string().min(1, "Kode wajib diisi"),
  name: z.string().min(1, "Nama wajib diisi"),
  description: z.string().optional(),
});

export type StockLocationsFormValues = z.infer<typeof stockLocationsSchema>;
