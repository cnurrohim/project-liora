import { Hono } from "hono";
import { db } from "../../db.js";

export const widgetRoute = new Hono();

// === CARD ===

// Total Items
widgetRoute.get("/total-items", async (c) => {
  const result = await db.query(
    `SELECT COUNT(*) AS total FROM inventory.items`
  );
  return c.json({ total: Number(result.rows[0].total) });
});

// Low Stock Alert
widgetRoute.get("/low-stock", async (c) => {
  const result = await db.query(`
    SELECT COUNT(*) AS low_stock
    FROM inventory.stock_balances sb
    JOIN inventory.items i ON i.id = sb.item_id
    WHERE sb.qty < i.min_stock
  `);
  return c.json({ total: Number(result.rows[0].low_stock) });
});

// Open Purchase Orders
widgetRoute.get("/open-po", async (c) => {
  const result = await db.query(`
    SELECT COUNT(*) AS open_po
    FROM inventory.purchase_orders
    WHERE status = 'confirmed'
  `);
  return c.json({ total: Number(result.rows[0].open_po) });
});

// === TABLE ===

// Recent Goods Receipts
widgetRoute.get("/recent-gr", async (c) => {
  const result = await db.query(`
    SELECT r.id, r.receipt_number, r.receipt_date, s.name as supplier 
    FROM inventory.goods_receipts r
    JOIN inventory.suppliers s on s.id = r.supplier_id
    ORDER BY r.receipt_date DESC
    LIMIT 20
  `);
  return c.json({ rows: result.rows });
});

// Recent Goods Issues
widgetRoute.get("/recent-gi", async (c) => {
  const result = await db.query(`
    SELECT iss.id, iss.issue_number, iss.issue_date, i.name, d.quantity, sl.code || '-' || sl."name" as source, sl.code || '-' || sl."name" as destination
    FROM inventory.goods_issue_items d
    JOIN inventory.goods_issues iss on iss.id = d.goods_issue_id
    JOIN inventory.items i on i.id = d.item_id
    join inventory.stock_locations sl on sl.id = d.source_location_id 
    join inventory.stock_locations slt on slt.id = d.target_location_id  
    ORDER BY iss.issue_date DESC
    LIMIT 20
  `);
  return c.json({ rows: result.rows });
});

// === CHART ===

// Monthly Goods Flow (Inbound vs Outbound)
widgetRoute.get("/monthly-flow", async (c) => {
  const result = await db.query(`
    SELECT to_char(created_at, 'YYYY-MM') AS month,
      SUM(CASE WHEN movement_type = 'inbound' THEN qty ELSE 0 END) AS inbound,
      SUM(CASE WHEN movement_type = 'outbound' THEN qty ELSE 0 END) AS outbound
    FROM inventory.stock_movements
    WHERE created_at >= (CURRENT_DATE - interval '12 month')
    GROUP BY month
    ORDER BY month
  `);
  return c.json({ rows: result.rows });
});

// Stock by Location
widgetRoute.get("/stock-by-location", async (c) => {
  const result = await db.query(`
    SELECT sl.name AS label, SUM(sb.qty)::int AS value
    FROM inventory.stock_balances sb
    JOIN inventory.stock_locations sl ON sl.id = sb.location_id
    GROUP BY sl.name
    ORDER BY value DESC
  `);
  return c.json({ rows: result.rows });
});

// Top 5 Fast-Moving Items
widgetRoute.get("/fast-moving", async (c) => {
  const result = await db.query(`
    SELECT i.name AS item, SUM(sm.qty)::int AS moved_qty
    FROM inventory.stock_movements sm
    JOIN inventory.items i ON i.id = sm.item_id
    WHERE sm.created_at >= (CURRENT_DATE - interval '30 day')
    GROUP BY i.name
    ORDER BY moved_qty DESC
    LIMIT 5
  `);
  return c.json({ rows: result.rows });
});
