import { Hono } from "hono";
import { db } from "../db.js";
import { authMiddleware } from "../middleware/auth.js";
import type { Variables } from "../types/context.js";
import { redis } from "../lib/redis.js";

export const menuRoute = new Hono<{ Variables: Variables }>();
menuRoute.use(authMiddleware);

// GET /menus
menuRoute.get("/", async (c) => {
  const user = c.get("user");
  const userId = user.id;

  const cachedMenus = await redis.get(`menus:${userId}`);
  if (cachedMenus) {
    return c.json({ data: JSON.parse(cachedMenus) });
  }

  // Ambil permission milik user (baik dari role maupun langsung)
  const { rows: userPerms } = await db.query(
    `
    SELECT DISTINCT p.id
    FROM permissions p
    LEFT JOIN role_permissions rp ON rp.permission_id = p.id
    LEFT JOIN user_roles ur ON ur.role_id = rp.role_id
    LEFT JOIN user_permissions up ON up.permission_id = p.id
    WHERE ur.user_id = $1 OR (up.user_id = $1 AND up.granted = true)
    `,
    [userId]
  );

  const userPermissionIds = userPerms.map((p) => p.id);

  // Ambil menu beserta permissionsnya
  const { rows: menus } = await db.query(
    `
    SELECT mi.*, 
           ARRAY_REMOVE(ARRAY_AGG(mp.permission_id), NULL) AS permission_ids
    FROM menu_items mi
    LEFT JOIN menu_permissions mp ON mp.menu_id = mi.id
    GROUP BY mi.id
    ORDER BY mi.ordinal ASC
    `
  );

  // Filter menu
  const filteredMenus = menus.filter((menu) => {
    if (menu.permission_ids.length === 0) {
      return true; // ✅ menu tanpa permission → tampil ke semua
    }
    return menu.permission_ids.some((permId: string) =>
      userPermissionIds.includes(permId)
    );
  });

  // Bentuk tree
  const map = new Map();
  filteredMenus.forEach((row) => map.set(row.id, { ...row, items: [] }));

  const tree: any[] = [];
  filteredMenus.forEach((row) => {
    if (row.parent_id) {
      const parent = map.get(row.parent_id);
      if (parent) parent.items.push(map.get(row.id));
    } else {
      tree.push(map.get(row.id));
    }
  });

  const cleanedTree = removeEmptyGroups(tree);

  await redis.set(`menus:${userId}`, JSON.stringify(cleanedTree), { EX: 300 });

  return c.json({ data: cleanedTree });
});

menuRoute.get("/parent-menu", async (c) => {
  const result = await db.query(
    `SELECT id, label, parent_id FROM menu_items WHERE type = 'group' ORDER BY label ASC`
  );
  return c.json({ data: result.rows });
});

menuRoute.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");

    const res = await db.query(
      `SELECT * FROM menu_items WHERE id = $1 LIMIT 1`,
      [id]
    );

    const data = res.rows[0];

    if (!data) return c.json({ error: "Menu not found" }, 404);

    return c.json({ data });
  } catch (err) {
    console.error("Error fetching menu:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// POST /menus
menuRoute.post("/", async (c) => {
  const client = await db.connect();
  const body = await c.req.json();

  const parent_id = body.parent_id ?? null;

  try {
    await client.query("BEGIN");
    const { rows } = await client.query(
      "SELECT MAX(ordinal) AS max FROM menu_items WHERE parent_id IS NOT DISTINCT FROM $1",
      [parent_id]
    );
    const newOrdinal = (rows[0].max || 0) + 1;

    const result = await client.query(
      `INSERT INTO menu_items 
        (id, parent_id, type, 
        label, description, icon, 
        icon_color, route, command, 
        mode, alignment, position, ordinal)
       VALUES 
        (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        body.parent_id ?? null,
        body.type,
        body.label,
        body.description,
        body.icon ?? null,
        body.icon_color ?? null,
        body.route ?? null,
        body.command ?? null,
        body.mode ?? null,
        body.alignment ?? null,
        body.position ?? 0,
        newOrdinal,
      ]
    );

    const menuId = result.rows[0].id;

    if (body.permissions?.length) {
      insertMenuPermissions(client, menuId, body.permissions);
    }

    await client.query("COMMIT");

    await clearRedisCache();

    return c.json({ data: result.rows[0] });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error insert menu:", err);
    return c.json({ error: "Gagal menambahkan menu" }, 400);
  } finally {
    client.release();
  }
});

// PUT /menus/:id
menuRoute.put("/:id", async (c) => {
  const client = await db.connect();
  const id = c.req.param("id");
  const body = await c.req.json();

  try {
    await client.query("BEGIN");
    await client.query(
      `UPDATE menu_items SET
        parent_id = $1,
        type = $2,
        label = $3,
        icon = $4,
        route = $5,
        command = $6,
        mode = $7,
        alignment = $8,
        position = $9,
        description = $10,
        icon_color = $11
       WHERE id = $12`,
      [
        body.parent_id ?? null,
        body.type,
        body.label,
        body.icon ?? null,
        body.route ?? null,
        body.command ?? null,
        body.mode ?? null,
        body.alignment ?? null,
        body.position ?? 0,
        body.description ?? null,
        body.icon_color ?? null,
        id,
      ]
    );

    await client.query(`DELETE FROM menu_permissions WHERE menu_id = $1`, [id]);
    if (body.permissions?.length) {
      insertMenuPermissions(client, id, body.permissions);
    }

    await client.query("COMMIT");

    await clearRedisCache();

    return c.json({ success: true });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error update menu:", err);
    return c.json({ error: "Gagal mengubah menu" }, 400);
  } finally {
    client.release();
  }
});

// DELETE /menus/:id
menuRoute.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const client = await db.connect();

  try {
    await client.query("BEGIN");
    // Step 1: Ambil data item sebelum dihapus
    const { rows } = await client.query(
      "SELECT ordinal, parent_id FROM menu_items WHERE id = $1",
      [id]
    );

    if (rows.length === 0) {
      return c.json({ error: "Item tidak ditemukan" }, 404);
    }

    const { ordinal, parent_id } = rows[0];

    // Step 2: Hapus item
    await client.query("DELETE FROM menu_items WHERE id = $1", [id]);
    await client.query(`DELETE FROM menu_permissions WHERE menu_id = $1`, [id]);

    // Step 3: Kurangi ordinal semua item di bawahnya
    await client.query(
      `UPDATE menu_items 
       SET ordinal = ordinal - 1 
       WHERE ordinal > $1 
         AND parent_id IS NOT DISTINCT FROM $2`,
      [ordinal, parent_id]
    );

    await client.query("COMMIT");

    await clearRedisCache();

    return c.json({ success: true });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error delete menu:", err);
    return c.json({ error: "Gagal menghapus menu" }, 400);
  } finally {
    client.release();
  }
});

menuRoute.post("/reorder", async (c) => {
  const { id, isMoveMenuUp } = await c.req.json();

  const {
    rows: [current],
  } = await db.query(
    "SELECT id, ordinal, parent_id FROM menu_items WHERE id = $1",
    [id]
  );
  if (!current) return c.json({ error: "Item not found" }, 404);

  const neighbor = await db.query(
    `SELECT id, ordinal FROM menu_items 
     WHERE parent_id IS NOT DISTINCT FROM $1 
     AND ordinal ${isMoveMenuUp === true ? "<" : ">"} $2
     ORDER BY ordinal ${isMoveMenuUp === true ? "DESC" : "ASC"}
     LIMIT 1`,
    [current.parent_id, current.ordinal]
  );

  if (neighbor.rowCount === 0) {
    return c.json({ error: "Tidak bisa digeser lagi" }, 400);
  }

  const { id: neighborId, ordinal: neighborOrdinal } = neighbor.rows[0];

  await Promise.all([
    db.query("UPDATE menu_items SET ordinal = $1 WHERE id = $2", [
      neighborOrdinal,
      id,
    ]),
    db.query("UPDATE menu_items SET ordinal = $1 WHERE id = $2", [
      current.ordinal,
      neighborId,
    ]),
  ]);

  await clearRedisCache();

  return c.json({ success: true });
});

menuRoute.post("/normalize-ordinal", async (c) => {
  const { parent_id } = await c.req.json();

  const { rows } = await db.query(
    `SELECT id FROM menu_items 
     WHERE parent_id IS NOT DISTINCT FROM $1
     ORDER BY ordinal ASC`,
    [parent_id]
  );

  for (let i = 0; i < rows.length; i++) {
    await db.query("UPDATE menu_items SET ordinal = $1 WHERE id = $2", [
      i,
      rows[i].id,
    ]);
  }

  await clearRedisCache();

  return c.json({ success: true });
});

interface Permission {
  id: string;
  name: string;
}

async function insertMenuPermissions(
  client: any,
  menuId: string,
  permissions?: Permission[]
) {
  if (!permissions || permissions.length === 0) {
    return;
  }

  const valuePlaceholders = permissions
    .map((_, idx) => `($${idx * 2 + 1}, $${idx * 2 + 2})`)
    .join(", ");

  const params: (string | number)[] = permissions.flatMap((p) => [
    p.id,
    menuId,
  ]);

  await client.query(
    `INSERT INTO menu_permissions (permission_id, menu_id) VALUES ${valuePlaceholders}`,
    params
  );
}

function removeEmptyGroups(menus: any[]): any[] {
  return menus
    .map((menu) => ({
      ...menu,
      items: removeEmptyGroups(menu.items || []),
    }))
    .filter((menu) => {
      if (menu.type === "group") {
        return menu.items.length > 0; // hanya group yang punya anak
      }
      return true; // menu biasa tetap tampil
    });
}

async function clearRedisCache() {
  const keys = await redis.keys("menus:*");
  if (keys.length > 0) {
    await redis.del(keys);
  }
}
