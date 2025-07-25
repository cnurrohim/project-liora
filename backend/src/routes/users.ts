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
      u.id, u.name, u.username, u.email, u.is_active, u.created_at, u.updated_at,
      json_agg(json_build_object('id', r.id, 'name', r.name, 'is_default', ur.is_default)) as roles
    FROM users u
    LEFT JOIN user_roles ur ON ur.user_id = u.id
    LEFT JOIN roles r ON r.id = ur.role_id
    GROUP BY u.id
  `);

  return c.json({ users: res.rows });
});

// ✅ GET /users/:id → Get single user detail
userRoute.get("/:id", async (c) => {
  const id = c.req.param("id");
  const res = await db.query(
    `
    SELECT
      u.id, u.name, u.username, u.email, u.is_active,
      json_agg(json_build_object('id', r.id, 'name', r.name, 'is_default', ur.is_default)) as roles
    FROM users u
    LEFT JOIN user_roles ur ON ur.user_id = u.id
    LEFT JOIN roles r ON r.id = ur.role_id
    WHERE u.id = $1
    GROUP BY u.id
    `,
    [id]
  );

  const user = res.rows[0];
  if (!user) return c.json({ error: "User not found" }, 404);

  return c.json({ user });
});

// ✅ POST /users → Create user
userRoute.post("/", async (c) => {
  const { name, username, email, password, is_active, roles, defaultRole } =
    await c.req.json();

  const pwHash = await bcrypt.hash(password, 10);

  const userRes = await db.query(
    `INSERT INTO users (name, username, email, password, is_active)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [name, username, email, pwHash, is_active ?? true]
  );
  const userId = userRes.rows[0].id;

  // Insert roles
  if (roles?.length) {
    for (const roleId of roles) {
      const isDefault = defaultRole === roleId;
      await db.query(
        `INSERT INTO user_roles (user_id, role_id, is_default) VALUES ($1, $2, $3)`,
        [userId, roleId, isDefault]
      );
    }
  }

  return c.json({ success: true, id: userId });
});

// ✅ PUT /users/:id → Update user
userRoute.put("/:id", async (c) => {
  const id = c.req.param("id");
  const { name, username, email, password, is_active, roles, defaultRole } =
    await c.req.json();

  // Update user info
  if (password) {
    const pwHash = await bcrypt.hash(password, 10);

    await db.query(
      `UPDATE users SET name = $1, username = $2, email = $3, password = $4, is_active = $5, updated_at = NOW() WHERE id = $6`,
      [name, username, email, pwHash, is_active, id]
    );
  } else {
    await db.query(
      `UPDATE users SET name = $1, username = $2, email = $3, is_active = $4, updated_at = NOW() WHERE id = $5`,
      [name, username, email, is_active, id]
    );
  }

  // Replace user_roles
  await db.query(`DELETE FROM user_roles WHERE user_id = $1`, [id]);

  if (roles?.length) {
    for (const roleId of roles) {
      const isDefault = defaultRole === roleId;
      await db.query(
        `INSERT INTO user_roles (user_id, role_id, is_default) VALUES ($1, $2, $3)`,
        [id, roleId, isDefault]
      );
    }
  }

  return c.json({ success: true });
});

// ✅ DELETE /users/:id → Delete user
userRoute.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id");

    await db.query(`DELETE FROM users WHERE id = $1`, [id]);

    return c.json({ success: true });
  } catch (err: any) {
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
