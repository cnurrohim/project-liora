import { Hono } from "hono";
import { db } from "../db.js";

export const departmentRoute = new Hono();

// GET /departments - ambil semua department
departmentRoute.get("/", async (c) => {
  const result = await db.query("SELECT * FROM departments ORDER BY name ASC");
  return c.json({ data: result.rows });
});

// GET /departments/parents - daftar kandidat parent
departmentRoute.get("/parents", async (c) => {
  const result = await db.query(
    `SELECT id, name FROM departments ORDER BY name ASC`
  );
  return c.json({ data: result.rows });
});

// GET /departments/tree - struktur tree sederhana (opsional)
departmentRoute.get("/tree", async (c) => {
  const result = await db.query("SELECT * FROM departments ORDER BY name ASC");
  const rows = result.rows;

  const map = new Map();
  rows.forEach((row) => map.set(row.id, { ...row, children: [] }));

  const tree: any[] = [];
  rows.forEach((row) => {
    if (row.parent_id) {
      const parent = map.get(row.parent_id);
      if (parent) parent.children.push(map.get(row.id));
    } else {
      tree.push(map.get(row.id));
    }
  });

  return c.json({ data: tree });
});

// GET /departments/:id - ambil detail 1
departmentRoute.get("/:id", async (c) => {
  const id = c.req.param("id");
  const result = await db.query("SELECT * FROM departments WHERE id = $1", [
    id,
  ]);
  const data = result.rows[0];
  if (!data) return c.json({ error: "Department not found" }, 404);
  return c.json({ data });
});

// POST /departments - tambah
departmentRoute.post("/", async (c) => {
  const body = await c.req.json();
  try {
    const result = await db.query(
      `INSERT INTO departments (id, name, description, parent_id)
       VALUES (gen_random_uuid(), $1, $2, $3)
       RETURNING *`,
      [body.name, body.description ?? null, body.parent_id ?? null]
    );
    return c.json({ data: result.rows[0] });
  } catch (err) {
    console.error("Insert department error:", err);
    return c.json({ error: "Gagal menambahkan department" }, 400);
  }
});

// PUT /departments/:id - update
departmentRoute.put("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();

  try {
    const result = await db.query(
      `UPDATE departments
       SET name = $1, description = $2, parent_id = $3, updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [body.name, body.description ?? null, body.parent_id ?? null, id]
    );
    if (!result.rows.length)
      return c.json({ error: "Department not found" }, 404);
    return c.json({ data: result.rows[0] });
  } catch (err) {
    console.error("Update department error:", err);
    return c.json({ error: "Gagal mengubah department" }, 400);
  }
});

// DELETE /departments/:id - hapus
departmentRoute.delete("/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const result = await db.query(
      `DELETE FROM departments WHERE id = $1 RETURNING *`,
      [id]
    );
    if (!result.rows.length)
      return c.json({ error: "Department not found" }, 404);
    return c.json({ data: result.rows[0] });
  } catch (err) {
    console.error("Delete department error:", err);
    return c.json({ error: "Gagal menghapus department" }, 400);
  }
});
