import { Hono } from "hono";
import { db } from "../../db.js";
import puppeteer from "puppeteer";
import { generateStockOnHandHTML } from "../../templates/StockOnHandPDF.js";
import { generateStockOnHandExcel } from "../../templates/StockOnHandExcel.js";
import { createExcel, createPDF } from "../../utils/reportCreator.js";

export const stockOnHandRoute = new Hono();

interface StockOnHand {
  search?: string;
  location_id?: string;
  limit?: number;
}

async function getFilteredStockOnHand(filters: StockOnHand = {}) {
  const { search, location_id, limit = 200 } = filters;

  const params: any[] = [];
  const whereClauses: string[] = [];

  if (search) {
    params.push(`%${search}%`);
    params.push(`%${search}%`);
    whereClauses.push(
      `(i.sku ILIKE $${params.length - 1} OR i.name ILIKE $${params.length})`
    );
  }

  if (location_id) {
    params.push(location_id);
    whereClauses.push(`sb.location_id = $${params.length}`);
  }

  const whereSQL = whereClauses.length
    ? "WHERE " + whereClauses.join(" AND ")
    : "";

  const sql = `
    SELECT 
      i.sku AS item_code,
      i.name AS item_name,
      sl.name AS location,
      sb.qty AS current_qty,
      (
        SELECT MAX(sm.created_at)
        FROM inventory.stock_movements sm
        WHERE sm.item_id = sb.item_id 
          AND (sm.source_location_id = sb.location_id OR sm.target_location_id = sb.location_id)
      ) AS last_movement
    FROM inventory.stock_balances sb
    JOIN inventory.items i ON sb.item_id = i.id
    JOIN inventory.stock_locations sl ON sb.location_id = sl.id
    ${whereSQL}
    ORDER BY i.sku, sl.name
    LIMIT ${limit}
  `;

  const result = await db.query(sql, params);
  return result.rows;
}

stockOnHandRoute.get("/", async (c) => {
  const filters = {
    search: c.req.query("search"),
    location_id: c.req.query("location_id"),
  };

  const data = await getFilteredStockOnHand({
    ...filters,
    limit: 1000,
  });

  return c.json({ data });
});

stockOnHandRoute.get(
  "/pdf",
  createPDF({
    filename: "inventory-on-hand",
    getFilters: (c) => ({
      search: c.req.query("search") || "",
      location_id: c.req.query("location_id") || "",
      location_name: c.req.query("location_name") || "",
    }),
    getData: (filters) => getFilteredStockOnHand({ ...filters, limit: 1000 }),
    buildHTML: generateStockOnHandHTML,
  })
);

stockOnHandRoute.get(
  "/excel",
  createExcel({
    filename: "inventory-on-hand",
    getFilters: (c) => ({
      search: c.req.query("search") || "",
      location_id: c.req.query("location_id") || "",
      location_name: c.req.query("location_name") || "",
    }),
    getData: (filters) => getFilteredStockOnHand({ ...filters, limit: 1000 }),
    buildExcel: generateStockOnHandExcel,
  })
);
