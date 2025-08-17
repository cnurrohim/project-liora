import { Hono } from "hono";
import { db } from "../db.js";
import { authMiddleware } from "../middleware/auth.js";
import { checkRole } from "../middleware/checkRole.js";
import bcrypt from "bcrypt";

export const userRoute = new Hono();

userRoute.use(authMiddleware);
// Optional: Tambah checkRole atau permission checker jika sudah

// ✅ GET /users → List all users
userRoute.get("/", async (c) => {
  const res = await db.query(`
    SELECT
      u.id,
      u.name,
      u.username,
      u.email,
      u.is_active,
      u.created_at,
      u.updated_at,

      -- roles
      COALESCE(json_agg(
        DISTINCT jsonb_build_object(
          'id', r.id,
          'name', r.name,
          'is_default', ur.is_default
        )
      ) FILTER (WHERE r.id IS NOT NULL), '[]') AS roles,

      -- departments
      COALESCE(json_agg(
        DISTINCT jsonb_build_object(
          'id', d.id,
          'name', d.name,
          'description', d.description
        )
      ) FILTER (WHERE d.id IS NOT NULL), '[]') AS departments

    FROM users u
    LEFT JOIN user_roles ur ON ur.user_id = u.id
    LEFT JOIN roles r ON r.id = ur.role_id
    LEFT JOIN user_departments ud ON ud.user_id = u.id
    LEFT JOIN departments d ON d.id = ud.department_id

    GROUP BY u.id
  `);

  return c.json({ users: res.rows });
});

userRoute.get("/detail/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const userDetail = await db.query(
      `SELECT id,
      name,
      username,
      email,
      is_active,
      created_at,
      updated_at FROM users WHERE id = $1`,
      [id]
    );

    // ambil semua role_id dulu
    const roleDetails = await db.query(
      `SELECT 
      ur.role_id as id,
      ur.is_default,
      r.name, 
      r.description 
      FROM user_roles ur
      JOIN roles r on r.id = ur.role_id
      WHERE ur.user_id = $1`,
      [id]
    );

    const roleIds = roleDetails.rows.map((r) => r.id);
    if (!roleIds.length) {
      return c.json({ error: "user tidak memiliki roles apapun" }, 404);
    }

    // ambil semua permissions dari role
    const permRes = await db.query(
      `
      SELECT DISTINCT ON (p.id)
        p.id, 
        p.name, 
        p.label, 
        p.description, 
        p.domain
      FROM role_permissions rp
      JOIN permissions p ON p.id = rp.permission_id
      WHERE rp.role_id = ANY($1::uuid[])
      AND p.id NOT IN (
        SELECT permission_id
        FROM user_permissions
        WHERE user_id = $2
      )
      ORDER BY p.id, p.domain, p.label
  `,
      [roleIds, id]
    );

    const userPermRes = await db.query(
      `
        SELECT DISTINCT ON (p.id)
          p.id,
          p.name,
          p.label,
          p.description,
          p.domain,
          up.granted
        FROM user_permissions up
        JOIN permissions p ON p.id = up.permission_id
        WHERE up.user_id = $1
        order by p.id
  `,
      [id]
    );

    const userDeparments = await db.query(
      `
        SELECT 
          p.id,
          p.name,
          p.description
        FROM user_departments up
        JOIN departments p ON p.id = up.department_id
        WHERE up.user_id = $1
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
        source: "role",
      });
    }

    for (const p of userPermRes.rows) {
      if (!groupedPermissions[p.domain]) {
        groupedPermissions[p.domain] = [];
      }
      // tandai permission dari user langsung
      groupedPermissions[p.domain].push({
        id: p.id,
        name: p.name,
        label: p.label,
        description: p.description,
        granted: p.granted,
        source: "user",
      });
    }

    return c.json({
      user: userDetail.rows[0],
      roles: roleDetails.rows,
      departments: userDeparments.rows,
      permissions: groupedPermissions,
    });
  } catch (err: any) {
    console.error("GET /roles/:id error", err);
    return c.json(
      { error: "Terjadi kesalahan saat mengambil data detail user" },
      500
    );
  }
});

// ✅ GET /users/:id → Get single user detail
userRoute.get("/:id", async (c) => {
  const id = c.req.param("id");

  const res = await db.query(
    `
    SELECT
      u.id, u.name, u.username, u.email, u.is_active,

      (
        SELECT json_agg(json_build_object(
          'id', r.id,
          'name', r.name,
          'is_default', ur.is_default
        ))
        FROM user_roles ur
        JOIN roles r ON r.id = ur.role_id
        WHERE ur.user_id = u.id
      ) AS roles,

      (
        SELECT ur.role_id
        FROM user_roles ur
        WHERE ur.user_id = u.id and ur.is_default is true
        limit 1
      ) AS default_role_id,

      (
        SELECT json_agg(json_build_object(
          'id', d.id,
          'name', d.name
        ))
        FROM user_departments ud
        JOIN departments d ON d.id = ud.department_id
        WHERE ud.user_id = u.id
      ) AS departments

    FROM users u
    WHERE u.id = $1
    `,
    [id]
  );

  const user = res.rows[0];
  if (!user) return c.json({ error: "User not found" }, 404);

  return c.json({ user });
});

// ✅ POST /users → Create user
userRoute.post("/", async (c) => {
  const client = await db.connect();
  try {
    const {
      name,
      username,
      email,
      password,
      is_active,
      roleIds,
      defaultRoleId,
      departmentIds,
      userPermissions,
    } = await c.req.json();

    await client.query("BEGIN");

    const pwHash = await bcrypt.hash(password, 10);

    const userRes = await client.query(
      `INSERT INTO users (name, username, email, password, is_active)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [name, username, email, pwHash, is_active ?? true]
    );

    const userId = userRes.rows[0].id;

    for (const roleId of roleIds) {
      const isDefault = roleId === defaultRoleId;
      await client.query(
        `INSERT INTO user_roles (user_id, role_id, is_default) VALUES ($1, $2, $3)`,
        [userId, roleId, isDefault]
      );
    }

    if (departmentIds?.length) {
      for (const departmentId of departmentIds) {
        await client.query(
          `INSERT INTO user_departments (user_id, department_id) VALUES ($1, $2)`,
          [userId, departmentId]
        );
      }
    }

    if (userPermissions) {
      for (const [permissionId, granted] of Object.entries(userPermissions)) {
        await client.query(
          `INSERT INTO user_permissions (user_id, permission_id, granted) VALUES ($1, $2, $3)`,
          [userId, permissionId, granted]
        );
      }
    }

    await client.query("COMMIT");
    return c.json({ success: true, id: userId });
  } catch (err: any) {
    await client.query("ROLLBACK");
    console.error("Gagal membuat user baru:", err);
    return c.json({ error: "Gagal membuat user baru." }, 500);
  } finally {
    client.release();
  }
});

// ✅ PUT /users/:id → Update user
userRoute.put("/:id", async (c) => {
  const client = await db.connect();
  try {
    const id = c.req.param("id");
    const {
      name,
      username,
      email,
      password,
      is_active,
      roleIds,
      departmentIds,
      defaultRoleId,
      userPermissions,
    } = await c.req.json();

    await client.query("BEGIN");

    // if (password) {
    //   const pwHash = await bcrypt.hash(password, 10);
    //   await client.query(
    //     `UPDATE users SET name = $1, username = $2, email = $3, password = $4, is_active = $5, updated_at = NOW() WHERE id = $6`,
    //     [name, username, email, pwHash, is_active, id]
    //   );
    // } else {
    await client.query(
      `UPDATE users SET name = $1, username = $2, email = $3, is_active = $4, updated_at = NOW() WHERE id = $5`,
      [name, username, email, is_active, id]
    );
    // }

    await client.query(`DELETE FROM user_roles WHERE user_id = $1`, [id]);

    if (roleIds?.length) {
      for (const roleId of roleIds) {
        const isDefault = defaultRoleId === roleId;
        await client.query(
          `INSERT INTO user_roles (user_id, role_id, is_default) VALUES ($1, $2, $3)`,
          [id, roleId, isDefault]
        );
      }
    }

    await client.query(`DELETE FROM user_departments WHERE user_id = $1`, [id]);
    if (departmentIds?.length) {
      for (const departmentId of departmentIds) {
        await client.query(
          `INSERT INTO user_departments (user_id, department_id) VALUES ($1, $2)`,
          [id, departmentId]
        );
      }
    }

    // Override user permissions
    await client.query(`DELETE FROM user_permissions WHERE user_id = $1`, [id]);
    if (userPermissions) {
      for (const [permissionId, granted] of Object.entries(userPermissions)) {
        await client.query(
          `INSERT INTO user_permissions (user_id, permission_id, granted) VALUES ($1, $2, $3)`,
          [id, permissionId, granted]
        );
      }
    }

    await client.query("COMMIT");
    return c.json({ success: true });
  } catch (err: any) {
    await client.query("ROLLBACK");
    console.error("Gagal update user:", err);
    return c.json({ error: "Gagal update user." }, 500);
  } finally {
    client.release();
  }
});

// ✅ DELETE /users/:id → Delete user
userRoute.delete("/:id", async (c) => {
  const client = await db.connect();
  try {
    const id = c.req.param("id");
    await client.query("BEGIN");
    await client.query(`DELETE FROM user_permissions WHERE user_id = $1`, [id]);
    await client.query(`DELETE FROM user_departments WHERE user_id = $1`, [id]);
    await client.query(`DELETE FROM user_roles WHERE user_id = $1`, [id]);
    await client.query(`DELETE FROM users WHERE id = $1`, [id]);
    await client.query("COMMIT");
    return c.json({ success: true });
  } catch (err: any) {
    await client.query("ROLLBACK");
    if (
      err.code === "23503" && // foreign_key_violation
      err.constraint === "user_roles_role_id_fkey"
    ) {
      return c.json(
        {
          error: `User tidak bisa dihapus karena masih digunakan di bagian lain aplikasi.`,
        },
        400
      );
    }

    console.error("Gagal hapus user:", err);
    return c.json({ error: "Gagal menghapus user." }, 500);
  }
});

userRoute.put("/:id/toggleActivation", async (c) => {
  const client = await db.connect();
  try {
    const id = c.req.param("id");
    await client.query("BEGIN");
    await client.query(
      `UPDATE users SET is_active = NOT is_active,  updated_at = NOW() WHERE id = $1`,
      [id]
    );
    await client.query("COMMIT");
    return c.json({ success: true });
  } catch (err: any) {
    await client.query("ROLLBACK");

    console.error("Gagal mengnonaktifkan user:", err);
    return c.json({ error: "Gagal mengnonaktifkan user." }, 500);
  }
});
