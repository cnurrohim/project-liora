import { Hono } from "hono";
import { z } from "zod";
import { db } from "../../db.js";

export const supplierRoute = new Hono();

// Zod schema for validation
const supplierSchema = z.object({
  name: z.string().min(1, "Supplier name is required"),
  contact: z.string().optional(),
  address: z.string().optional(),
});

// GET /suppliers - fetch all suppliers
supplierRoute.get("/", async (c) => {
  const result = await db.query(
    "SELECT * FROM inventory.suppliers WHERE deleted_at IS NULL ORDER BY name ASC"
  );
  return c.json({ data: result.rows });
});

// GET /suppliers/:id - fetch supplier detail
supplierRoute.get("/:id", async (c) => {
  const id = c.req.param("id");
  const result = await db.query(
    "SELECT * FROM inventory.suppliers WHERE id = $1 AND deleted_at IS NULL",
    [id]
  );
  const data = result.rows[0];
  if (!data) return c.json({ error: "Supplier not found" }, 404);
  return c.json({ data });
});

// POST /suppliers - create new supplier
supplierRoute.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const parsed = supplierSchema.parse(body); // zod validation

    const result = await db.query(
      `INSERT INTO inventory.suppliers (id, name, contact, address)
       VALUES (gen_random_uuid(), $1, $2, $3)
       RETURNING *`,
      [parsed.name, parsed.contact ?? null, parsed.address ?? null]
    );
    return c.json({ data: result.rows[0] });
  } catch (err: any) {
    console.error("Insert supplier error:", err);
    if (err instanceof z.ZodError) {
      return c.json({ error: err.flatten() }, 400);
    }
    return c.json({ error: "Failed to create supplier" }, 400);
  }
});

// PUT /suppliers/:id - update supplier
supplierRoute.put("/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const body = await c.req.json();
    const parsed = supplierSchema.parse(body); // zod validation

    const result = await db.query(
      `UPDATE inventory.suppliers
       SET name = $1, contact = $2, address = $3, updated_at = NOW()
       WHERE id = $4 AND deleted_at IS NULL
       RETURNING *`,
      [parsed.name, parsed.contact ?? null, parsed.address ?? null, id]
    );
    if (!result.rows.length)
      return c.json({ error: "Supplier not found" }, 404);
    return c.json({ data: result.rows[0] });
  } catch (err: any) {
    console.error("Update supplier error:", err);
    if (err instanceof z.ZodError) {
      return c.json({ error: err.flatten() }, 400);
    }
    return c.json({ error: "Failed to update supplier" }, 400);
  }
});

// DELETE /suppliers/:id - soft delete supplier
supplierRoute.delete("/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const result = await db.query(
      `UPDATE inventory.suppliers
       SET deleted_at = NOW()
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING *`,
      [id]
    );
    if (!result.rows.length)
      return c.json({ error: "Supplier not found" }, 404);
    return c.json({ message: "Supplier deleted successfully" });
  } catch (err) {
    console.error("Delete supplier error:", err);
    return c.json({ error: "Failed to delete supplier" }, 400);
  }
});
