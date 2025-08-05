import { z } from "zod";

export const schema = z
  .object({
    name: z.string().min(1, "Nama wajib diisi"),
    username: z.string().min(1, "Username wajib diisi"),
    email: z.string().email("Email tidak valid"),
    password: z.string().min(3, "Minimal 3 karakter").optional(),
    is_active: z.boolean(),
    roles: z
      .array(
        z.object({
          id: z.string(),
          name: z.string(),
        })
      )
      .min(1, { message: "Pilih minimal satu role" }),
    defaultRole: z.string().min(1, "Pilih role default"),
    departments: z
      .array(
        z.object({
          id: z.string(),
          name: z.string(),
        })
      )
      .min(1, { message: "Pilih minimal satu departemen" }),
  })
  .refine((data) => data.roles.some((r) => r.id === data.defaultRole), {
    message: "Default role harus salah satu dari daftar role",
    path: ["defaultRole"],
  });
