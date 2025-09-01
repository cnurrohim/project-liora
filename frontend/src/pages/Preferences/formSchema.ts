// src/pages/preferences/formSchema.ts
import { z } from "zod";

export const layoutSchema = z.object({
  leftPane: z.string().nullable(),
  rightPane: z.string().nullable(),
  topPane: z.string().nullable(),
  bottomPane: z.string().nullable(),
  defaultPage: z.string().nullable().optional(),
  defaultNewTab: z.string().nullable().optional(),
});

export type LayoutFormValues = z.infer<typeof layoutSchema>;
