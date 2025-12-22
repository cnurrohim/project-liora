import { Hono } from "hono";
import { db } from "../../db.js";
import puppeteer from "puppeteer";
import { generateInventoryDetailsHTML } from "../../templates/printInventoryDetailsPDF.js";
import { generateInventoryDetailsExcel } from "../../templates/printInventoryDetailsExcel.js";
import { createExcel, createPDF } from "../../utils/reportCreator.js";

export const itemDetailsRoute = new Hono();

async function getFilteredItemDetails(term?: string) {
  const hasTerm = term && term.length > 0;

  const params: any[] = [];

  let whereClause = "WHERE l.deleted_at IS NULL";

  if (hasTerm) {
    params.push(`%${term}%`);
    whereClause += `
      AND (
        LOWER(i.sku)  ILIKE $${params.length} OR
        LOWER(i.name) ILIKE $${params.length}
      )`;
  }

  const sql = `
    SELECT 
      i.sku,
      i.min_stock, 
      i.name AS name,
      jsonb_object_agg(
          COALESCE(l.id::text, 'UNKNOWN'),
          COALESCE(sb.qty, 0)
      ) AS locations,
      COALESCE(SUM(sb.qty), 0) AS total_qty
    FROM inventory.items i
    LEFT JOIN inventory.stock_balances sb 
      ON sb.item_id = i.id
    LEFT JOIN inventory.stock_locations l 
      ON sb.location_id = l.id
    ${whereClause}
    GROUP BY i.sku, i.name, i.min_stock
    ORDER BY i.name;
  `;

  const result = await db.query(sql, params);
  return result.rows;
}

async function getAllLocations() {
  const result = await db.query(
    "SELECT * FROM inventory.stock_locations WHERE deleted_at IS NULL ORDER BY code ASC"
  );
  return result.rows;
}

itemDetailsRoute.get("/", async (c) => {
  const term = c.req.query("term")?.trim().toLowerCase();
  const data = await getFilteredItemDetails(term);
  return c.json({ data });
});

itemDetailsRoute.get(
  "/pdf",
  createPDF({
    filename: "inventory-details",
    getFilters: (c) => ({
      term: c.req.query("term")?.trim().toLowerCase(),
    }),
    getData: async ({ term }) => {
      const data = await getFilteredItemDetails(term);
      const locations = await getAllLocations();
      return { data, locations };
    },
    buildHTML: ({ data, locations }) =>
      generateInventoryDetailsHTML(data, locations),
  })
);

itemDetailsRoute.get(
  "/excel",
  createExcel({
    filename: "inventory-details",
    getFilters: (c) => ({
      term: c.req.query("term")?.trim().toLowerCase(),
    }),
    getData: async ({ term }) => {
      const data = await getFilteredItemDetails(term);
      const locations = await getAllLocations();
      return { data, locations };
    },
    buildExcel: ({ data, locations }) =>
      generateInventoryDetailsExcel(data, locations),
  })
);
