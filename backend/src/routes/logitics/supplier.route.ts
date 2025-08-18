// src/routes/supplier.route.ts
import { Hono } from "hono";
import { z } from "zod";
import { db } from "../../db.js";

export const supplierRoute = new Hono();

// Schema Zod untuk validasi
const supplierSchema = z.object({
  name: z.string().min(1, "Nama supplier wajib diisi"),
  contact: z.string().optional(),
  address: z.string().optional(),
});

// GET /suppliers - ambil semua supplier
supplierRoute.get("/", async (c) => {
  const result = await db.query(
    "SELECT * FROM logistics.suppliers ORDER BY name ASC"
  );
  return c.json({ data: result.rows });
});

// GET /suppliers/:id - ambil detail supplier
supplierRoute.get("/:id", async (c) => {
  const id = c.req.param("id");
  const result = await db.query(
    "SELECT * FROM logistics.suppliers WHERE id = $1",
    [id]
  );
  const data = result.rows[0];
  if (!data) return c.json({ error: "Supplier not found" }, 404);
  return c.json({ data });
});

// POST /suppliers - tambah supplier baru
supplierRoute.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const parsed = supplierSchema.parse(body); // validasi zod

    const result = await db.query(
      `INSERT INTO logistics.suppliers (id, name, contact, address)
       VALUES (gen_random_uuid(), $1, $2, $3)
       RETURNING *`,
      [parsed.name, parsed.contact ?? null, parsed.address ?? null]
    );
    return c.json({ data: result.rows[0] });
  } catch (err: any) {
    console.error("Insert supplier error:", err);
    if (err instanceof z.ZodError) {
      return c.json({ error: err.flatten }, 400);
    }
    return c.json({ error: "Gagal menambahkan supplier" }, 400);
  }
});

// PUT /suppliers/:id - update supplier
supplierRoute.put("/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const body = await c.req.json();
    const parsed = supplierSchema.parse(body); // validasi zod

    const result = await db.query(
      `UPDATE logistics.suppliers
       SET name = $1, contact = $2, address = $3, updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [parsed.name, parsed.contact ?? null, parsed.address ?? null, id]
    );
    if (!result.rows.length)
      return c.json({ error: "Supplier not found" }, 404);
    return c.json({ data: result.rows[0] });
  } catch (err: any) {
    console.error("Update supplier error:", err);
    if (err instanceof z.ZodError) {
      return c.json({ error: err.flatten }, 400);
    }
    return c.json({ error: "Gagal mengubah supplier" }, 400);
  }
});

// DELETE /suppliers/:id - hapus supplier
supplierRoute.delete("/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const result = await db.query(
      "DELETE FROM logistics.suppliers WHERE id = $1 RETURNING *",
      [id]
    );
    if (!result.rows.length)
      return c.json({ error: "Supplier not found" }, 404);
    return c.json({ data: result.rows[0] });
  } catch (err) {
    console.error("Delete supplier error:", err);
    return c.json({ error: "Gagal menghapus supplier" }, 400);
  }
});
