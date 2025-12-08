import { z } from "zod";

export const supplierSchema = z.object({
  name: z.string().min(1, "Nama supplier wajib diisi"),
  contact: z.string().optional(),
  address: z.string().optional(),
});

export type SupplierFormValues = z.infer<typeof supplierSchema>;
