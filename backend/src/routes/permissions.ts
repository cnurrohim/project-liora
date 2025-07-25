import { Hono } from "hono";
import { db } from "../db.js";
import { authMiddleware } from "../middleware/auth.js";

export const permissionRoute = new Hono();

permissionRoute.use(authMiddleware);

// Get all permissions
permissionRoute.get("/", async (c) => {
  try {
    const result = await db.query(
      "SELECT id, name, label, description, domain FROM permissions ORDER BY name ASC"
    );
    return c.json({ permissions: result.rows });
  } catch (err) {
    console.error("GET /permissions error", err);
    return c.json({ error: "Failed to fetch permissions" }, 500);
  }
});

// Create new permission
permissionRoute.post("/", async (c) => {
  try {
    const { name, label, description } = await c.req.json();

    if (!name) {
      return c.json({ error: "Permission name is required" }, 400);
    }

    const result = await db.query(
      "INSERT INTO permissions (name,  label, description, domain) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, label, description ?? null]
    );

    return c.json({ permission: result.rows[0] });
  } catch (err) {
    console.error("POST /permissions error", err);
    return c.json({ error: "Failed to create permission" }, 500);
  }
});

// Update permission
permissionRoute.put("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const { name, description, domain, label } = await c.req.json();

    const result = await db.query(
      "UPDATE permissions SET name = $1, description = $2, domain = $3, label = $4 WHERE id = $4 RETURNING *",
      [name, description ?? null, domain, id]
    );

    if (result.rowCount === 0) {
      return c.json({ error: "Permission not found" }, 404);
    }

    return c.json({ permission: result.rows[0] });
  } catch (err) {
    console.error("PUT /permissions/:id error", err);
    return c.json({ error: "Failed to update permission" }, 500);
  }
});

// Delete permission
permissionRoute.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id");

    const result = await db.query("DELETE FROM permissions WHERE id = $1", [
      id,
    ]);

    if (result.rowCount === 0) {
      return c.json({ error: "Permission not found" }, 404);
    }

    return c.json({ success: true });
  } catch (err) {
    console.error("DELETE /permissions/:id error", err);
    return c.json({ error: "Failed to delete permission" }, 500);
  }
});
