import { Hono } from "hono";
import { db } from "../db.js";
import { authMiddleware } from "../middleware/auth.js";
import type { Variables } from "../types/context.js";
import { clearRedisCache, redis } from "../lib/redis.js";

export const menuRoute = new Hono<{ Variables: Variables }>();
menuRoute.use(authMiddleware);

type MenuRow = {
  id: string;
  parent_id: string | null;
  menu_key: string | null;
  type: string; // 'group'|'route'|'command'
  label: string;
  icon?: string | null;
  route?: string | null;
  command?: string | null;
  mode?: string | null;
  alignment?: string | null;
  position?: number | null;
  ordinal?: number | null;
  description?: string | null;
  icon_color?: string | null;
  permission_ids: string[]; // from ARRAY_AGG
};

type MenuTreeNode = MenuRow & {
  items: MenuTreeNode[];
  isPinned?: boolean;
};

// GET /menus
menuRoute.get("/", async (c) => {
  try {
    const user = c.get("user");
    if (!user || !user.id) return c.json({ error: "Unauthorized" }, 401);

    const userId = String(user.id);
    const roleId = String(user.role);

    const cacheKey = `menus:${userId}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return c.json(JSON.parse(cached));
    }

    // fetch
    const [userPermissionIds, menus, pinnedIds] = await Promise.all([
      getUserPermissionIds(userId),
      getMenus(),
      getPinnedMenuIds(userId, roleId),
    ]);

    // filter by permission
    const filteredMenus = filterMenusByPermissions(menus, userPermissionIds);

    // build tree
    const tree = buildMenuTree(filteredMenus);

    // mark pinned (and collect them)
    const pinnedAcc: MenuTreeNode[] = [];
    const markPinned = (nodes: MenuTreeNode[]) => {
      for (const node of nodes) {
        if (pinnedIds.includes(node.id)) {
          node.isPinned = true;
          pinnedAcc.push(node);
        }
        if (node.items && node.items.length) markPinned(node.items);
      }
    };
    markPinned(tree);

    // optional: preserve pinned order as pinnedIds
    const pinnedMenusOrdered = pinnedIds
      .map((id) => pinnedAcc.find((n) => n.id === id))
      .filter(Boolean) as MenuTreeNode[];

    // remove empty groups but keep pinned nodes
    const cleanedTree = removeEmptyGroups(tree);

    // pinned group
    const pinnedTree = makePinnedTree(pinnedMenusOrdered);
    const finalMenuTree = [...(pinnedTree ? [pinnedTree] : []), ...cleanedTree];

    // final response
    const response = { data: finalMenuTree };

    // cache (store the full response object)
    await redis.set(cacheKey, JSON.stringify(response), { EX: 300 });

    return c.json(response);
  } catch (err) {
    console.error("GET /menus error", err);
    return c.json({ error: "Failed to fetch menus" }, 500);
  }
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

function removeEmptyGroups(nodes: MenuTreeNode[]): MenuTreeNode[] {
  return nodes
    .map((n) => ({ ...n, items: removeEmptyGroups(n.items || []) }))
    .filter((n) => {
      // keep groups that either have children or are explicitly pinned
      if (n.type === "group") {
        return Boolean(n.isPinned) || (n.items && n.items.length > 0);
      }
      // non-group (route/command) always kept (unless you want extra filtering)
      return true;
    });
}

// === helper DB functions with explicit return types ===
async function getUserPermissionIds(userId: string): Promise<string[]> {
  const res = await db.query(
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
  const rows = res.rows as { id: string }[];
  return rows.map((r) => r.id);
}

async function getMenus(): Promise<MenuRow[]> {
  const res = await db.query(
    `
    SELECT mi.*, 
           ARRAY_REMOVE(ARRAY_AGG(mp.permission_id), NULL) AS permission_ids
    FROM menu_items mi
    LEFT JOIN menu_permissions mp ON mp.menu_id = mi.id
    GROUP BY mi.id
    ORDER BY mi.ordinal ASC
    `
  );
  return res.rows as MenuRow[];
}

async function getPinnedMenuIds(
  userId: string,
  roleId: string
): Promise<string[]> {
  const res = await db.query(
    `
    SELECT menu_id
    FROM user_pinned_menus
    WHERE user_id = $1 AND role_id = $2
    ORDER BY pinned_at ASC
    `,
    [userId, roleId]
  );
  return (res.rows as { menu_id: string }[]).map((r) => r.menu_id);
}

function filterMenusByPermissions(
  menus: MenuRow[],
  userPermissionIds: string[]
): MenuRow[] {
  return menus.filter((menu) => {
    const perms = menu.permission_ids ?? [];
    if (perms.length === 0) return true;
    return perms.some((permId) => userPermissionIds.includes(permId));
  });
}

function buildMenuTree(filteredMenus: MenuRow[]): MenuTreeNode[] {
  const map = new Map<string, MenuTreeNode>();
  // init nodes
  filteredMenus.forEach((row) => {
    map.set(row.id, { ...row, items: [] });
  });

  const tree: MenuTreeNode[] = [];
  filteredMenus.forEach((row) => {
    const node = map.get(row.id)!;
    if (row.parent_id) {
      const parent = map.get(row.parent_id);
      if (parent) parent.items.push(node);
    } else {
      tree.push(node);
    }
  });

  return tree;
}

function makePinnedTree(pinnedMenus: MenuTreeNode[]): MenuTreeNode | null {
  if (pinnedMenus.length === 0) {
    return null; // tidak ada pin, tidak tampilkan group
  }

  return {
    id: "pinned-menus",
    parent_id: null,
    menu_key: null,
    type: "group",
    label: "Pinned",
    icon: "RiPushpin2Fill",
    route: "",
    command: "",
    mode: "sliding",
    alignment: "start",
    position: 0,
    ordinal: 0,
    description: "Pinned menus",
    icon_color: null,
    permission_ids: [],
    items: pinnedMenus,
  };
}
