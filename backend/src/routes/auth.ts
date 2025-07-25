import { Hono } from "hono";
import { db } from "../db.js";
import {
  comparePassword,
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/auth.js";
import { authMiddleware } from "../middleware/auth.js";

export const authRoute = new Hono();

async function getUserPermissions(userId: string, activeRoleId: string) {
  const [rolePerms, userPerms] = await Promise.all([
    db.query(
      `
      SELECT p.name
      FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.id
      WHERE rp.role_id = $1
      `,
      [activeRoleId]
    ),
    db.query(
      `
      SELECT p.name
      FROM user_permissions up
      JOIN permissions p ON up.permission_id = p.id
      WHERE up.user_id = $1
      `,
      [userId]
    ),
  ]);

  const permissions = new Set([
    ...rolePerms.rows.map((r) => r.name),
    ...userPerms.rows.map((r) => r.name),
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

  const rolesRes = await db.query(
    `
    SELECT r.id, r.name, ur.is_default
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = $1
    `,
    [user.id]
  );
  const roles = rolesRes.rows;
  const defaultRole = roles.find((r) => r.is_default) || roles[0];

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

  return c.json({
    token,
    refreshToken,
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

  const newToken = generateToken({
    id: user.id,
    name: user.name,
    role: role.id,
  });

  const refreshToken = generateRefreshToken({
    id: user.id,
    name: user.name,
  });

  const permissions = await getUserPermissions(user.id, role.id);

  return c.json({
    token: newToken,
    refreshToken,
    selectedRole: role,
    permissions,
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
  const refreshToken = c.req.header("Authorization")?.replace("Bearer ", "");
  if (!refreshToken) return c.json({ error: "Missing token" }, 401);

  try {
    const decoded = verifyRefreshToken(refreshToken);
    const user = decoded as { id: string; name: string };

    const newAccessToken = generateToken({
      id: user.id,
      name: user.name,
    });

    return c.json({ token: newAccessToken });
  } catch {
    return c.json({ error: "Invalid refresh token" }, 401);
  }
});
