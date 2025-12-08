import { Hono } from "hono";
import { db } from "../../db.js";

export const departmentRoute = new Hono();

// GET /departments - ambil semua department
departmentRoute.get("/", async (c) => {
  const result = await db.query(
    "SELECT * FROM departments WHERE deleted_at IS NULL ORDER BY name ASC"
  );
  return c.json({ data: result.rows });
});

// GET /departments/parents - daftar kandidat parent
departmentRoute.get("/parents", async (c) => {
  const result = await db.query(
    `SELECT id, name 
     FROM departments 
     WHERE deleted_at IS NULL 
     ORDER BY name ASC`
  );
  return c.json({ data: result.rows });
});

// GET /departments/tree - struktur tree sederhana
departmentRoute.get("/tree", async (c) => {
  const result = await db.query(
    "SELECT * FROM departments WHERE deleted_at IS NULL ORDER BY name ASC"
  );
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
  const result = await db.query(
    "SELECT * FROM departments WHERE id = $1 AND deleted_at IS NULL",
    [id]
  );
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
    return c.json({ error: "Failed adding new department" }, 400);
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
       WHERE id = $4 AND deleted_at IS NULL
       RETURNING *`,
      [body.name, body.description ?? null, body.parent_id ?? null, id]
    );
    if (!result.rows.length)
      return c.json({ error: "Department not found" }, 404);
    return c.json({ data: result.rows[0] });
  } catch (err) {
    console.error("Update department error:", err);
    return c.json({ error: "Failed to delete department" }, 400);
  }
});

// DELETE /departments/:id - soft delete
departmentRoute.delete("/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const result = await db.query(
      `UPDATE departments 
       SET deleted_at = NOW(), updated_at = NOW()
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING *`,
      [id]
    );
    if (!result.rows.length)
      return c.json({ error: "Department not found" }, 404);
    return c.json({ data: result.rows[0] });
  } catch (err) {
    console.error("Delete department error:", err);
    return c.json({ error: "Failed to delete department" }, 400);
  }
});
