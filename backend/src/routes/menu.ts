import { Hono } from "hono";
import { db } from "../db.js";

export const menuRoute = new Hono();

// GET /menus
menuRoute.get("/", async (c) => {
  const result = await db.query(
    "SELECT * FROM menu_items ORDER BY ordinal ASC"
  );

  const rows = result.rows;
  const map = new Map();
  rows.forEach((row) => map.set(row.id, { ...row, items: [] }));

  const tree: any[] = [];
  rows.forEach((row) => {
    if (row.parent_id) {
      const parent = map.get(row.parent_id);
      if (parent) parent.items.push(map.get(row.id));
    } else {
      tree.push(map.get(row.id));
    }
  });

  return c.json({ data: tree });
});

menuRoute.get("/parent-menu", async (c) => {
  const result = await db.query(
    `SELECT id, label, parent_id FROM menu_items WHERE type = 'group' ORDER BY label ASC`
  );
  return c.json({ data: result.rows });
});

// POST /menus
menuRoute.post("/", async (c) => {
  const body = await c.req.json();

  const parent_id = body.parent_id ?? null;

  try {
    const { rows } = await db.query(
      "SELECT MAX(ordinal) AS max FROM menu_items WHERE parent_id IS NOT DISTINCT FROM $1",
      [parent_id]
    );
    const newOrdinal = (rows[0].max || 0) + 1;

    const result = await db.query(
      `INSERT INTO menu_items 
        (id, parent_id, type, label, description, icon, icon_color, route, command, mode, alignment, position, ordinal)
       VALUES 
        (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
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

    return c.json({ data: result.rows[0] });
  } catch (err) {
    console.error("Error insert menu:", err);
    return c.json({ error: "Gagal menambahkan menu" }, 400);
  }
});

// PUT /menus/:id
menuRoute.put("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();

  try {
    await db.query(
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
        icon_color = $11,
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

    return c.json({ success: true });
  } catch (err) {
    console.error("Error update menu:", err);
    return c.json({ error: "Gagal mengubah menu" }, 400);
  }
});

// DELETE /menus/:id
menuRoute.delete("/:id", async (c) => {
  const id = c.req.param("id");

  try {
    // Step 1: Ambil data item sebelum dihapus
    const { rows } = await db.query(
      "SELECT ordinal, parent_id FROM menu_items WHERE id = $1",
      [id]
    );

    if (rows.length === 0) {
      return c.json({ error: "Item tidak ditemukan" }, 404);
    }

    const { ordinal, parent_id } = rows[0];

    // Step 2: Hapus item
    await db.query("DELETE FROM menu_items WHERE id = $1", [id]);

    // Step 3: Kurangi ordinal semua item di bawahnya
    await db.query(
      `UPDATE menu_items 
       SET ordinal = ordinal - 1 
       WHERE ordinal > $1 
         AND parent_id IS NOT DISTINCT FROM $2`,
      [ordinal, parent_id]
    );

    return c.json({ success: true });
  } catch (err) {
    console.error("Error delete menu:", err);
    return c.json({ error: "Gagal menghapus menu" }, 400);
  }
});

menuRoute.post("/reorder", async (c) => {
  const { id, isLiftUp } = await c.req.json();

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
     AND ordinal ${isLiftUp === true ? "<" : ">"} $3
     ORDER BY ordinal ${isLiftUp === true ? "DESC" : "ASC"}
     LIMIT 1`,
    [current.parent_id, current.menu_key, current.ordinal]
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

  return c.json({ success: true });
});
