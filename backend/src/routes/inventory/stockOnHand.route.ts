import { Hono } from "hono";
import { db } from "../../db.js";
import puppeteer from "puppeteer";
import { generateStockOnHandHTML } from "../../templates/StockOnHandPDF.js";
import { generateStockOnHandExcel } from "../../templates/StockOnHandExcel.js";

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

stockOnHandRoute.get("/pdf", async (c) => {
  const filters = {
    search: c.req.query("search"),
    location_id: c.req.query("location_id"),
    location_name: c.req.query("location_name"),
  };

  const data = await getFilteredStockOnHand({
    ...filters,
    limit: 1000,
  });

  const html = generateStockOnHandHTML(data, filters);

  // render pakai Puppeteer
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });
  const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
  await browser.close();

  c.header("Content-Type", "application/pdf");
  c.header("Content-Disposition", "attachment; filename=stock-movement.pdf");
  return c.body(pdfBuffer);
});

stockOnHandRoute.get("/excel", async (c) => {
  const filters = {
    search: c.req.query("search"),
    location_id: c.req.query("location_id"),
    location_name: c.req.query("location_name"),
  };

  const data = await getFilteredStockOnHand({
    ...filters,
    limit: 1000,
  });

  const excelBuffer = await generateStockOnHandExcel(data, filters);

  c.header(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  c.header("Content-Disposition", "attachment; filename=stock-movement.xlsx");
  return c.body(excelBuffer);
});
