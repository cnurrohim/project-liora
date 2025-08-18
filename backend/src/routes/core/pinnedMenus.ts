import { Hono } from "hono";
import { db } from "../../db.js";
import { authMiddleware } from "../../middleware/auth.js";
import type { Variables } from "../../types/context.js";
import { clearRedisCache } from "../../lib/redis.js";

export const pinnedMenusRoute = new Hono<{ Variables: Variables }>();
pinnedMenusRoute.use(authMiddleware);

pinnedMenusRoute.get("/", async (c) => {
  const user = c.get("user");
  const { rows } = await db.query(
    `
      SELECT pm.menu_id as id, m.label, m.icon, m.type, m.route
      FROM user_pinned_menus pm
      JOIN menu_items m ON m.id = pm.menu_id
      WHERE pm.user_id = $1 AND pm.role_id = $2
      ORDER BY pm.pinned_at ASC
      `,
    [user.id, user.role]
  );
  return c.json(rows);
});

// Pin menu
pinnedMenusRoute.post("/", async (c) => {
  const body = await c.req.json();
  const user = c.get("user");

  try {
    const { rows } = await db.query(
      `
          INSERT INTO user_pinned_menus (user_id, role_id, menu_id)
          VALUES ($1, $2, $3)
          ON CONFLICT (user_id, role_id, menu_id) DO NOTHING
          RETURNING *
          `,
      [user.id, user.role, body.menu_id]
    );

    await clearRedisCache();

    return c.json(rows[0] ?? { message: "Already pinned" });
  } catch (err) {
    console.error(err);
    return c.json({ error: "Failed to pin menu" }, 500);
  }
});

// Unpin menu
pinnedMenusRoute.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const user = c.get("user");

  await db.query(
    `DELETE FROM user_pinned_menus WHERE user_id = $1 AND role_id = $2 AND menu_id = $3`,
    [user.id, user.role, id]
  );

  await clearRedisCache();

  return c.json({ message: "Unpinned successfully" });
});
