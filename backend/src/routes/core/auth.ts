import { Hono } from "hono";
import { db } from "../../db.js";
import {
  comparePassword,
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/auth.js";
import { authMiddleware } from "../../middleware/auth.js";
import { getCookie, setCookie } from "hono/cookie";

export const authRoute = new Hono();

async function getUserPermissions(userId: string, activeRoleId: string) {
  const [rolePerms, userPerms] = await Promise.all([
    db.query(
      `
      SELECT p.domain, p.name
      FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.id
      WHERE rp.role_id = $1
      `,
      [activeRoleId]
    ),
    db.query(
      `
      SELECT p.domain, p.name
      FROM user_permissions up
      JOIN permissions p ON up.permission_id = p.id
      WHERE up.user_id = $1
      `,
      [userId]
    ),
  ]);

  const permissions = new Set([
    ...rolePerms.rows.map((r) => `${r.domain}.${r.name}`),
    ...userPerms.rows.map((r) => `${r.domain}.${r.name}`),
  ]);

  return Array.from(permissions);
}

authRoute.post("/login", async (c) => {
  const { username, password } = await c.req.json();

  const result = await db.query(
    "SELECT * FROM users WHERE username = $1 OR email = $1 LIMIT 1",
    [username]
  );
  const user = result.rows[0];
  if (!user) return c.json({ error: "User not found" }, 401);

  const valid = await comparePassword(password, user.password);
  if (!valid) return c.json({ error: "Invalid password" }, 401);

  const roles = await getUserRoles(user.id);
  const defaultRole = roles.find((r) => r.is_default) || roles[0];

  await db.query("UPDATE users SET active_role_id = $1 WHERE id = $2", [
    defaultRole.id,
    user.id,
  ]);

  const token = generateToken({
    id: String(user.id),
    name: user.name,
    role: String(defaultRole?.id),
  });

  const refreshToken = generateRefreshToken({
    id: user.id,
    name: user.name,
  });

  const permissions = await getUserPermissions(user.id, defaultRole.id);

  setCookie(c, "refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
    maxAge: 60 * 60 * 24 * 7, // 7 hari
    path: "/",
  });

  return c.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      roles: roles.map((r) => ({ id: r.id, name: r.name })),
      defaultRole: defaultRole
        ? { id: defaultRole.id, name: defaultRole.name }
        : null,
      permissions,
    },
  });
});

async function getUserRoles(userId: string) {
  const rolesRes = await db.query(
    `
    SELECT r.id, r.name, ur.is_default
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = $1
    `,
    [userId]
  );
  return rolesRes.rows;
}

authRoute.post("/switch-role", authMiddleware, async (c) => {
  const { roleId } = await c.req.json();
  const user = c.get("user");

  const roleCheck = await db.query(
    `
    SELECT r.id, r.name
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = $1 AND ur.role_id = $2
    `,
    [user.id, roleId]
  );
  const role = roleCheck.rows[0];
  if (!role) return c.json({ error: "Invalid role or not assigned" }, 403);

  // simpan role aktif
  await db.query("UPDATE users SET active_role_id = $1 WHERE id = $2", [
    role.id,
    user.id,
  ]);

  // buat token baru
  const token = generateToken({
    id: String(user.id),
    name: user.name,
    role: String(role.id),
  });

  const refreshToken = generateRefreshToken({
    id: user.id,
    name: user.name,
  });

  // set cookie refresh token baru
  setCookie(c, "refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  const permissions = await getUserPermissions(user.id, role.id);
  const roles = await getUserRoles(user.id);

  return c.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      roles: roles.map((r) => ({ id: r.id, name: r.name })),
      defaultRole: { id: role.id, name: role.name },
      permissions,
    },
  });
});

authRoute.get("/me", authMiddleware, async (c) => {
  const user = c.get("user");

  if (!user || !user.id || !user.role) {
    return c.json({ error: "User data invalid" }, 400);
  }

  try {
    const permissions = await getUserPermissions(user.id, String(user.role));

    return c.json({
      user: {
        ...user,
        permissions,
      },
    });
  } catch (err) {
    console.error("Error getting user permissions:", err);
    return c.json({ error: "Gagal memuat data user" }, 500);
  }
});

authRoute.post("/refresh", async (c) => {
  const refreshToken = getCookie(c, "refreshToken"); // ✅ benar
  if (!refreshToken) return c.json({ error: "Missing token" }, 401);

  try {
    const decoded = verifyRefreshToken(refreshToken);
    const user = decoded as { id: string; name: string };

    // ⬇️ Cari default role user dari DB
    const res = await db.query(
      `
  SELECT ur.role_id
  FROM user_roles ur
  WHERE ur.user_id = $1 AND ur.role_id = (
    SELECT active_role_id FROM users WHERE id = $1
  )
  `,
      [user.id]
    );
    if (!res.rowCount) {
      return c.json({ error: "Invalid active role" }, 400);
    }

    const activeRole = res.rows[0].role_id;

    const newAccessToken = generateToken({
      id: user.id,
      name: user.name,
      role: activeRole, // ⬅️ Tambahkan role
    });

    return c.json({ token: newAccessToken });
  } catch {
    return c.json({ error: "Invalid refresh token" }, 401);
  }
});

authRoute.post("/logout", async (c) => {
  setCookie(c, "refreshToken", "", {
    maxAge: 0,
    path: "/",
  });
  return c.json({ message: "Logged out" });
});
