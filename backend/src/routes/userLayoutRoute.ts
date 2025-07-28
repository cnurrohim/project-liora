import { Hono } from "hono";
import { db } from "../db.js";

export const userLayoutRoute = new Hono();

// GET layout preference by user_id and role_id
userLayoutRoute.get("/:userId/:roleId", async (c) => {
  const user_id = c.req.param("userId");
  const role_id = c.req.param("roleId");

  if (!user_id || !role_id) {
    return c.json({ error: "user_id and role_id are required" }, 400);
  }

  try {
    const result = await db.query(
      `SELECT layout FROM user_layout_preferences WHERE user_id = $1 AND role_id = $2`,
      [user_id, role_id]
    );

    if (result.rows.length === 0) {
      return c.json({ layout: null });
    }

    return c.json({ layout: result.rows[0].layout });
  } catch (err) {
    console.error("Failed to get layout:", err);
    return c.json({ error: "Failed to fetch layout" }, 500);
  }
});

// POST or UPDATE (upsert) layout preference
userLayoutRoute.post("/", async (c) => {
  const body = await c.req.json();
  const { user_id, role_id, layout } = body;

  if (!user_id || !role_id || !layout) {
    return c.json({ error: "user_id, role_id, and layout are required" }, 400);
  }

  try {
    await db.query(
      `
      INSERT INTO user_layout_preferences (user_id, role_id, layout)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, role_id)
      DO UPDATE SET layout = EXCLUDED.layout, updated_at = now()
      `,
      [user_id, role_id, layout]
    );

    return c.json({ success: true });
  } catch (err) {
    console.error("Failed to save layout:", err);
    return c.json({ error: "Failed to save layout" }, 500);
  }
});
