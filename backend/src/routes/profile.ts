import { Hono } from "hono";
import { db } from "../db.js";
import { authMiddleware } from "../middleware/auth.js";
import type { Variables } from "../types/context.js";
import bcrypt from "bcrypt";
import * as fs from "fs";
import { writeFile } from "fs/promises";
import path from "path";
import { HTTPException } from "hono/http-exception";

export const profileRoute = new Hono<{ Variables: Variables }>();

profileRoute.use(authMiddleware);

profileRoute.get("/me", async (c) => {
  const userId = c.get("user").id;

  // Ambil info user
  const { rows: userRows } = await db.query(
    `SELECT id, name, username, email, profile_photo, phone_number, address
     FROM users
     WHERE id = $1`,
    [userId]
  );
  const user = userRows[0];
  if (!user) return c.json({ error: "User not found" }, 401);

  // Ambil role
  const { rows: roles } = await db.query(
    `
    SELECT r.id, r.name, ur.is_default
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = $1
    `,
    [user.id]
  );

  const { rows } = await db.query(
    `
  SELECT r.id, r.name
  FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  WHERE ur.user_id = $1
    AND ur.role_id = (
      SELECT active_role_id
      FROM users
      WHERE id = $1
    )
  `,
    [user.id]
  );

  const defaultRole = rows[0] || null;

  return c.json({
    user: {
      ...user,
      roles: roles.map((r) => ({ id: r.id, name: r.name })),
      defaultRole: defaultRole
        ? { id: defaultRole.id, name: defaultRole.name }
        : null,
    },
  });
});

// ✅ GET /profile → Ambil data user login
profileRoute.get("/", async (c) => {
  const userId = c.get("user").id;
  const res = await db.query(
    `SELECT id, name, username, email, profile_photo, phone_number, address 
     FROM users WHERE id = $1`,
    [userId]
  );

  if (!res.rows[0]) {
    return c.json({ error: "User not found" }, 404);
  }

  return c.json({
    user: {
      ...res.rows[0],
      profile_photo_url: res.rows[0].profile_photo
        ? `/uploads/profile-photo/${res.rows[0].profile_photo}`
        : null,
    },
  });
});

profileRoute.put("/", async (c) => {
  const body = await c.req.parseBody();
  const username = body.username as string;
  const name = body.name as string;
  const email = body.email as string;
  const address = body.address as string;
  const phone_number = body.phone_number as string;
  const password = body.password as string | undefined;
  const profile_photo = body.profile_photo as File | undefined;

  const userId = c.get("user").id;

  try {
    const userDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "profile-photo",
      String(userId)
    );

    let filename: string | undefined;
    if (profile_photo) {
      const ext = path.extname(profile_photo.name).toLowerCase();
      const allowed = [".png", ".jpeg", ".jpg"];
      if (!allowed.includes(ext)) {
        return c.json({ error: "Only PNG, JPEG, JPG allowed" }, 400);
      }

      if (fs.existsSync(userDir)) {
        fs.rmSync(userDir, { recursive: true, force: true });
      }

      fs.mkdirSync(userDir, { recursive: true });

      filename = `profile_photo_${Date.now()}${ext}`;
      const buffer = await profile_photo.arrayBuffer();
      await writeFile(path.join(userDir, filename), Buffer.from(buffer));
    }

    if (password) {
      const hash = await bcrypt.hash(password, 10);
      await db.query(
        `UPDATE users 
         SET username=$1, name=$2, email=$3, phone_number=$4, 
             profile_photo=COALESCE($5, profile_photo),
             password=$6, address=$7, updated_at=NOW()
         WHERE id=$8`,
        [
          username,
          name,
          email,
          phone_number,
          filename ? `/uploads/profile-photo/${userId}/${filename}` : null,
          hash,
          address,
          userId,
        ]
      );
    } else {
      await db.query(
        `UPDATE users 
         SET username=$1, name=$2, email=$3, phone_number=$4, 
             profile_photo=COALESCE($5, profile_photo),
             address=$6, updated_at=NOW()
         WHERE id=$7`,
        [
          username,
          name,
          email,
          phone_number,
          filename ? `/uploads/profile-photo/${userId}/${filename}` : null,
          address,
          userId,
        ]
      );
    }

    return c.json({
      success: true,
      profile_photo_url: filename
        ? `/uploads/profile-photo/${userId}/${filename}`
        : undefined,
    });
  } catch (err: any) {
    if (err.code === "23505" && err.constraint === "users_username_key") {
      throw new HTTPException(409, {
        message: "Username sudah digunakan oleh pengguna lain",
      });
    }
    throw err;
  }
});
