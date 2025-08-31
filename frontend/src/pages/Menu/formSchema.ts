// src/routes/Menu/formSchema.ts
import { z } from "zod";
import { MENU } from "@/constants/menu";

export const menuSchema = z.object({
  label: z.string().min(1, "Label wajib diisi"),
  description: z.string().optional(),
  icon: z.string().min(1, "Icon wajib diisi"),
  icon_color: z.string().nullable().optional(),
  type: z.enum([MENU.TYPE.ROUTE, MENU.TYPE.COMMAND, MENU.TYPE.GROUP]),
  route: z.string().nullable(), // hanya untuk type "route"
  command: z.string().optional(), // hanya untuk type "command"
  parent_id: z.string().nullable().optional(),
  mode: z.string().optional(),
  alignment: z.string().optional(),
  permissions: z
    .array(z.object({ id: z.string(), name: z.string() }))
    .optional(),
});

export type MenuFormValues = z.infer<typeof menuSchema>;
