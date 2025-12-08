import { Hono } from "hono";
import { db } from "../../db.js";
import { authMiddleware } from "../../middleware/auth.js";

export const permissionRoute = new Hono();

permissionRoute.use(authMiddleware);

// Get all permissions (not deleted)
permissionRoute.get("/", async (c) => {
  try {
    const result = await db.query(
      "SELECT id, name, label, description, domain FROM permissions WHERE deleted_at IS NULL ORDER BY name ASC"
    );
    return c.json({ permissions: result.rows });
  } catch (err) {
    console.error("GET /permissions error", err);
    return c.json({ error: "Failed to fetch permissions" }, 500);
  }
});

permissionRoute.get("/view-only", async (c) => {
  try {
    const result = await db.query(
      "SELECT id, name, label, description, domain FROM permissions WHERE deleted_at IS NULL AND name = 'view' ORDER BY name ASC"
    );
    return c.json({ permissions: result.rows });
  } catch (err) {
    console.error("GET /permissions/view-only error", err);
    return c.json({ error: "Failed to fetch permissions" }, 500);
  }
});

// Get permissions by role IDs
permissionRoute.get("/by-roles", async (c) => {
  try {
    const roleIdsParam = c.req.query("roleIds");
    if (!roleIdsParam) {
      return c.json({ error: "Missing roleIds query parameter" }, 400);
    }

    const roleIds = roleIdsParam.split(",");

    if (!Array.isArray(roleIds) || roleIds.length === 0) {
      return c.json({ error: "Invalid roleIds" }, 400);
    }

    const result = await db.query(
      `
      SELECT DISTINCT p.id, p.name, p.label, p.domain, p.description
      FROM permissions p
      JOIN role_permissions rp ON rp.permission_id = p.id
      WHERE rp.role_id = ANY($1::uuid[])
        AND p.deleted_at IS NULL
      ORDER BY p.name ASC
      `,
      [roleIds]
    );

    return c.json({ permissions: result.rows });
  } catch (err) {
    console.error("GET /permissions/by-roles error", err);
    return c.json({ error: "Failed to fetch permissions by role" }, 500);
  }
});

// Get user permission overrides (this table might not need soft delete)
permissionRoute.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const result = await db.query(
      `SELECT permission_id, granted FROM user_permissions WHERE user_id = $1`,
      [id]
    );
    return c.json({ permissions: result.rows });
  } catch (err) {
    console.error("GET /permissions/:id error", err);
    return c.json({ error: "Failed to fetch permissions" }, 500);
  }
});

// Create new permission
permissionRoute.post("/", async (c) => {
  try {
    const { name, label, description, domain } = await c.req.json();

    if (!name) {
      return c.json({ error: "Permission name is required" }, 400);
    }

    const result = await db.query(
      "INSERT INTO permissions (name, label, description, domain) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, label, description ?? null, domain ?? null]
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
      "UPDATE permissions SET name = $1, description = $2, domain = $3, label = $4 WHERE id = $5 AND deleted_at IS NULL RETURNING *",
      [name, description ?? null, domain ?? null, label ?? null, id]
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

// Soft delete permission
permissionRoute.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id");

    const result = await db.query(
      "UPDATE permissions SET deleted_at = now() WHERE id = $1 AND deleted_at IS NULL RETURNING id",
      [id]
    );

    if (result.rowCount === 0) {
      return c.json({ error: "Permission not found or already deleted" }, 404);
    }

    return c.json({ success: true });
  } catch (err) {
    console.error("DELETE /permissions/:id error", err);
    return c.json({ error: "Failed to delete permission" }, 500);
  }
});
