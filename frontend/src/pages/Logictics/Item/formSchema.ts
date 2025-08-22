// src/schema/item.schema.ts
import { z } from "zod";

export const itemSchema = z.object({
  sku: z.string().min(1, "SKU wajib diisi"),
  name: z.string().min(1, "Nama barang wajib diisi"),
  min_stock: z
    .number("Minimal stok harus berupa angka")
    .int("Minimal stok harus bilangan bulat")
    .min(0, "Minimal stok harus >= 0")
    .optional(),
});

export type ItemFormValues = z.infer<typeof itemSchema>;
