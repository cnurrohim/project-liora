import { Hono } from "hono";
import { db } from "../../db.js";

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
      `SELECT layout,default_page, default_new_tab, theme FROM user_layout_preferences WHERE user_id = $1 AND role_id = $2`,
      [user_id, role_id]
    );

    if (result.rows.length === 0) {
      return c.json({
        layout: null,
        default_page: null,
        default_new_tab: null,
        theme: null,
      });
    }

    return c.json({
      layout: result.rows[0].layout,
      default_page: result.rows[0].default_page,
      default_new_tab: result.rows[0].default_new_tab,
      theme: result.rows[0].theme,
    });
  } catch (err) {
    console.error("Failed to get layout:", err);
    return c.json({ error: "Failed to fetch layout" }, 500);
  }
});

userLayoutRoute.get("config/:userId/:roleId", async (c) => {
  const user_id = c.req.param("userId");
  const role_id = c.req.param("roleId");

  if (!user_id || !role_id) {
    return c.json({ error: "user_id and role_id are required" }, 400);
  }

  try {
    const result = await db.query(
      `SELECT default_page, default_new_tab, theme FROM user_layout_preferences WHERE user_id = $1 AND role_id = $2`,
      [user_id, role_id]
    );

    if (result.rows.length === 0) {
      return c.json({ default_page: null, default_new_tab: null, theme: null });
    }

    return c.json({
      default_page: result.rows[0].default_page,
      default_new_tab: result.rows[0].default_new_tab,
      theme: result.rows[0].theme,
    });
  } catch (err) {
    console.error("Failed to get layout:", err);
    return c.json({ error: "Failed to fetch layout" }, 500);
  }
});

// POST or UPDATE (upsert) layout preference
userLayoutRoute.post("/", async (c) => {
  const body = await c.req.json();
  const { user_id, role_id, layout, config } = body;

  if (!user_id || !role_id || !layout) {
    return c.json({ error: "user_id, role_id, and layout are required" }, 400);
  }

  try {
    await db.query(
      `
      INSERT INTO user_layout_preferences (user_id, role_id, layout, default_page, default_new_tab, theme)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (user_id, role_id)
      DO UPDATE SET layout = EXCLUDED.layout, default_page = EXCLUDED.default_page, default_new_tab = EXCLUDED.default_new_tab, theme = EXCLUDED.theme, updated_at = now()
      `,
      [
        user_id,
        role_id,
        layout,
        config.default_page,
        config.default_new_tab,
        config.theme,
      ]
    );

    return c.json({ success: true });
  } catch (err) {
    console.error("Failed to save layout & config:", err);
    return c.json({ error: "Failed to save layout" }, 500);
  }
});
