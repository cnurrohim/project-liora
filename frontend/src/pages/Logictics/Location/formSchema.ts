import { z } from "zod";

export const locationSchema = z.object({
  code: z.string().min(1, "Kode wajib diisi"),
  description: z.string().optional(),
});

export type LocationFormValues = z.infer<typeof locationSchema>;
