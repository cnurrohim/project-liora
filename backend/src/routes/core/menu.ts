import { Hono } from "hono";
import { db } from "../../db.js";
import { authMiddleware } from "../../middleware/auth.js";
import type { Variables } from "../../types/context.js";
import { clearRedisCache, redis } from "../../lib/redis.js";
import { MENU } from "../../constants/menu.js";

export const menuRoute = new Hono<{ Variables: Variables }>();
menuRoute.use(authMiddleware);

type Permission = {
  id: string;
  domain: string;
  name: string;
};

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

type RouteMenuMeta = {
  icon: string | null;
  icon_color: string | null;
  label: string;
  id: string;
};

// GET /menus
menuRoute.get("/", async (c) => {
  try {
    const user = c.get("user");
    if (!user || !user.id) return c.json({ error: "Unauthorized" }, 401);

    const userId = String(user.id);
    const roleId = String(user.role);

    const cacheKey = `menus:${userId}:${roleId}`;
    const cached = await redis.get(cacheKey);
    // if (cached) {
    //   return c.json(JSON.parse(cached));
    // }

    // fetch
    const [userPermissions, menus, pinnedIds] = await Promise.all([
      getUserPermissions(userId, roleId),
      getMenus(),
      getPinnedMenuIds(userId, roleId),
    ]);

    // filter by permission
    const filteredMenus = filterMenusByPermissions(menus, userPermissions);
    // build tree
    const tree = buildMenuTree(filteredMenus);

    // mark pinned
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

    const pinnedMenusOrdered = pinnedIds
      .map((id) => pinnedAcc.find((n) => n.id === id))
      .filter(Boolean) as MenuTreeNode[];

    const pinnedTree = makePinnedTree(pinnedMenusOrdered);
    const finalMenuTree = [...(pinnedTree ? [pinnedTree] : []), ...tree];

    const routeMenuMap: Record<string, RouteMenuMeta> = {};
    for (const menu of menus) {
      if (menu.type === "route" && menu.route) {
        routeMenuMap[menu.route] = {
          id: menu.id,
          label: menu.label,
          icon: menu.icon ?? null,
          icon_color: menu.icon_color ?? null,
        };
      }
    }

    const response = { data: finalMenuTree, routeMenuMap };

    await redis.set(cacheKey, JSON.stringify(response), { EX: 300 });

    return c.json(response);
  } catch (err) {
    console.error("GET /menus error", err);
    return c.json({ error: "Failed to fetch menus" }, 500);
  }
});

menuRoute.get("/parent-menu", async (c) => {
  const result = await db.query(
    `SELECT id, label, parent_id 
     FROM menu_items 
     WHERE type = 'group' AND deleted_at IS NULL 
     ORDER BY label ASC`,
  );
  return c.json({ data: result.rows });
});

menuRoute.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");

    const res = await db.query(
      `SELECT mi.*,
        (
          SELECT json_agg(json_build_object(
            'id', r.id,
            'name', r.name,
            'label', r.label,
            'domain', r.domain
          ))
          FROM menu_permissions mp
          JOIN permissions r ON r.id = mp.permission_id
          WHERE mp.menu_id = mi.id
        ) AS permissions
       FROM menu_items mi 
       WHERE mi.id = $1 AND mi.deleted_at IS NULL
       LIMIT 1`,
      [id],
    );

    const data = res.rows[0];
    if (!data) return c.json({ error: "Menu not found" }, 404);

    return c.json({ data });
  } catch (err) {
    console.error("Error fetching menu:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// POST /menus (tidak perlu where karena insert baru)
menuRoute.post("/", async (c) => {
  const client = await db.connect();
  const body = await c.req.json();

  const parent_id = body.parent_id ?? null;

  try {
    await client.query("BEGIN");
    const { rows } = await client.query(
      "SELECT MAX(ordinal) AS max FROM menu_items WHERE parent_id IS NOT DISTINCT FROM $1 AND deleted_at IS NULL",
      [parent_id],
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
      ],
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
    return c.json({ error: "Adding new menu failed" }, 400);
  } finally {
    client.release();
  }
});

// PUT /menus/:id (update biasa)
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
       WHERE id = $12 AND deleted_at IS NULL`,
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
      ],
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

// DELETE /menus/:id (soft delete)
menuRoute.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const client = await db.connect();

  try {
    await client.query("BEGIN");
    const { rows } = await client.query(
      "SELECT ordinal, parent_id FROM menu_items WHERE id = $1 AND deleted_at IS NULL",
      [id],
    );

    if (rows.length === 0) {
      return c.json({ error: "Item not found" }, 404);
    }

    const { ordinal, parent_id } = rows[0];

    // soft delete
    await client.query(
      "UPDATE menu_items SET deleted_at = now() WHERE id = $1",
      [id],
    );
    await client.query(`DELETE FROM menu_permissions WHERE menu_id = $1`, [id]);

    await client.query(
      `UPDATE menu_items 
       SET ordinal = ordinal - 1 
       WHERE ordinal > $1 
         AND parent_id IS NOT DISTINCT FROM $2
         AND deleted_at IS NULL`,
      [ordinal, parent_id],
    );

    await client.query("COMMIT");
    await clearRedisCache();

    return c.json({ success: true });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error delete menu:", err);
    return c.json({ error: "Failed to delete menu" }, 400);
  } finally {
    client.release();
  }
});

menuRoute.post("/reorder", async (c) => {
  const { id, isMoveMenuUp } = await c.req.json();

  const {
    rows: [current],
  } = await db.query(
    "SELECT id, ordinal, parent_id FROM menu_items WHERE id = $1 AND deleted_at IS NULL",
    [id],
  );
  if (!current) return c.json({ error: "Item not found" }, 404);

  const neighbor = await db.query(
    `SELECT id, ordinal FROM menu_items 
     WHERE parent_id IS NOT DISTINCT FROM $1 
       AND ordinal ${isMoveMenuUp === true ? "<" : ">"} $2
       AND deleted_at IS NULL
     ORDER BY ordinal ${isMoveMenuUp === true ? "DESC" : "ASC"}
     LIMIT 1`,
    [current.parent_id, current.ordinal],
  );

  if (neighbor.rowCount === 0) {
    return c.json({ error: "Item cannot be shift anymore" }, 400);
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
       AND deleted_at IS NULL
     ORDER BY ordinal ASC`,
    [parent_id],
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

async function insertMenuPermissions(
  client: any,
  menuId: string,
  permissions?: Permission[],
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
    params,
  );
}

// === helper DB functions ===
async function getUserPermissions(
  userId: string,
  roleId?: string,
): Promise<Permission[]> {
  const params = [];
  params.push(userId);
  let whereClause = `WHERE (ur.user_id = $1 OR (up.user_id = $1 AND up.granted = true))`;

  if (roleId) {
    params.push(roleId);
    whereClause = `WHERE (ur.user_id = $1 OR (up.user_id = $1 AND up.granted = true)) and rp.role_id = $2`;
  }

  const sql = `
    SELECT DISTINCT p.id, p.domain, p.name
    FROM permissions p
    LEFT JOIN role_permissions rp ON rp.permission_id = p.id
    LEFT JOIN user_roles ur ON ur.role_id = rp.role_id
    LEFT JOIN user_permissions up ON up.permission_id = p.id
    ${whereClause}
    `;

  const res = await db.query(sql, params);

  return res.rows as Permission[];
}

async function getMenus(): Promise<MenuRow[]> {
  const res = await db.query(
    `
    SELECT mi.*, 
           ARRAY_REMOVE(ARRAY_AGG(mp.permission_id), NULL) AS permission_ids
    FROM menu_items mi
    LEFT JOIN menu_permissions mp ON mp.menu_id = mi.id
    WHERE mi.deleted_at IS NULL
    GROUP BY mi.id
    ORDER BY mi.ordinal ASC
    `,
  );
  return res.rows as MenuRow[];
}

async function getPinnedMenuIds(
  userId: string,
  roleId: string,
): Promise<string[]> {
  const res = await db.query(
    `
    SELECT menu_id
    FROM user_pinned_menus
    WHERE user_id = $1 AND role_id = $2
    `,
    [userId, roleId],
  );
  return (res.rows as { menu_id: string }[]).map((r) => r.menu_id);
}

// filter menu by permission (unchanged)
function filterMenusByPermissions(
  menus: MenuRow[],
  userPermissions: Permission[],
): MenuRow[] {
  const hasAllAccess = userPermissions.some((p) => p.name === "all_access");
  if (hasAllAccess) return menus;

  const userPermissionIds = userPermissions.map((p) => p.id);

  return menus.filter((menu) => {
    const perms = menu.permission_ids ?? [];

    if (menu.type === MENU.TYPE.GROUP) return true;
    return perms.some((permId) => userPermissionIds.includes(permId));
  });
}

function buildMenuTree(filteredMenus: MenuRow[]): MenuTreeNode[] {
  const map = new Map<string, MenuTreeNode>();

  // add child placeholder
  filteredMenus.forEach((row) => {
    map.set(row.id, { ...row, items: [] });
  });

  // add child sub menu
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

  const cleanedTree = prune(tree);
  return cleanedTree;
}

function prune(nodes: MenuTreeNode[]): MenuTreeNode[] {
  return nodes
    .map((node) => ({
      ...node,
      items: prune(node.items),
    }))
    .filter((node) => {
      if (node.type === "group" && node.items.length === 0) {
        return false;
      }
      return true;
    });
}

function makePinnedTree(pinnedMenus: MenuTreeNode[]): MenuTreeNode | null {
  if (pinnedMenus.length === 0) return null;

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
