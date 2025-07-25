import { Hono } from "hono";
import { db } from "../db.js";
import { authMiddleware } from "../middleware/auth.js";

export const roleRoute = new Hono();

roleRoute.use(authMiddleware); // hanya untuk user yang sudah login

roleRoute.get("/", async (c) => {
  const result = await db.query(
    "SELECT id, name, description FROM roles ORDER BY name ASC"
  );
  return c.json({ roles: result.rows });
});

// GET /roles/:id
roleRoute.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");

    const roleRes = await db.query(
      "SELECT id, name, description FROM roles WHERE id = $1",
      [id]
    );

    if (roleRes.rows.length === 0) {
      return c.notFound();
    }

    const permissionsRes = await db.query(
      `
      SELECT p.id, p.name, p.description
      FROM permissions p
      JOIN role_permissions rp ON rp.permission_id = p.id
      WHERE rp.role_id = $1
      `,
      [id]
    );

    return c.json({
      ...roleRes.rows[0],
      permissions: permissionsRes.rows,
    });
  } catch (err) {
    console.error("GET /roles/:id error", err);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

roleRoute.get("/detail/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const roleRes = await db.query(
      `SELECT id, name, description FROM roles WHERE id = $1`,
      [id]
    );

    if (roleRes.rowCount === 0) {
      return c.json({ error: "Role tidak ditemukan" }, 404);
    }

    const permRes = await db.query(
      `
      SELECT p.id, p.name, p.label, p.description, p.domain
      FROM role_permissions rp
      JOIN permissions p ON p.id = rp.permission_id
      WHERE rp.role_id = $1
      ORDER BY p.domain, p.label
      `,
      [id]
    );

    const groupedPermissions: Record<string, any[]> = {};
    for (const p of permRes.rows) {
      if (!groupedPermissions[p.domain]) {
        groupedPermissions[p.domain] = [];
      }
      groupedPermissions[p.domain].push({
        id: p.id,
        name: p.name,
        label: p.label,
        description: p.description,
      });
    }

    return c.json({
      role: roleRes.rows[0],
      permissions: groupedPermissions,
    });
  } catch (err: any) {
    console.error("GET /roles/:id error", err);
    return c.json({ error: "Terjadi kesalahan saat mengambil data role" }, 500);
  }
});

roleRoute.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const { name, description, permissions } = body;

    const result = await db.query(
      `INSERT INTO roles (name, description) VALUES ($1, $2) RETURNING id`,
      [name, description]
    );

    const roleId = result.rows[0].id;

    if (Array.isArray(permissions)) {
      for (const permId of permissions) {
        await db.query(
          `INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2)`,
          [roleId, permId]
        );
      }
    }

    return c.json({ success: true });
  } catch (err) {
    console.error(err);
    return c.json({ error: "Gagal membuat role" }, 500);
  }
});

roleRoute.put("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const { name, description, permissions } = body;

    await db.query(
      `UPDATE roles SET name = $1, description = $2 WHERE id = $3`,
      [name, description, id]
    );

    // Bersihkan dulu permission lama
    await db.query(`DELETE FROM role_permissions WHERE role_id = $1`, [id]);

    if (Array.isArray(permissions)) {
      for (const permId of permissions) {
        await db.query(
          `INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2)`,
          [id, permId]
        );
      }
    }

    return c.json({ success: true });
  } catch (err) {
    console.error(err);
    return c.json({ error: "Gagal memperbarui role" }, 500);
  }
});

roleRoute.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id");

    await db.query(`DELETE FROM roles WHERE id = $1`, [id]);

    return c.json({ success: true });
  } catch (err: any) {
    if (
      err.code === "23503" && // foreign_key_violation
      err.constraint === "user_roles_role_id_fkey"
    ) {
      return c.json(
        {
          error:
            "Role tidak bisa dihapus karena sedang digunakan oleh pengguna lain.",
        },
        400
      );
    }

    console.error("Gagal hapus role:", err);
    return c.json({ error: "Gagal menghapus role." }, 500);
  }
});
