import { Hono } from "hono";
import { db } from "../../db.js";
import puppeteer from "puppeteer";
import { generateStockLocationHTML } from "../../templates/StockLocationPDF.js";
import { generateStockLocationExcel } from "../../templates/StockLocationExcel.js";

export const stockLocationReportRoute = new Hono();

interface StockLocation {
  location_id?: string;
  location_name?: string;
  limit?: number;
}

async function getFilteredStockOnHand(filters: StockLocation = {}) {
  const { location_id, limit = 200 } = filters;

  const params: any[] = [];
  const whereClauses: string[] = [];

  if (location_id) {
    params.push(location_id);
    whereClauses.push(`sl.id = $${params.length}`);
  }

  const whereSQL = whereClauses.length
    ? "WHERE " + whereClauses.join(" AND ")
    : "";

  const sql = `
    SELECT 
      sl.id AS location_id,
      sl.code || ' ' || sl.name AS location,
      COUNT(DISTINCT sb.item_id) AS total_item_types,
      COALESCE(SUM(sb.qty), 0) AS total_qty,
      (
        SELECT MAX(sm.created_at)
        FROM inventory.stock_movements sm
        WHERE sm.source_location_id = sl.id OR sm.target_location_id = sl.id
      ) AS last_update
    FROM inventory.stock_locations sl
    LEFT JOIN inventory.stock_balances sb ON sb.location_id = sl.id
    ${whereSQL}
    GROUP BY sl.id, sl.name, sl.code
    ORDER BY sl.name
    LIMIT ${limit}
  `;

  const result = await db.query(sql, params);
  return result.rows;
}

stockLocationReportRoute.get("/", async (c) => {
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

stockLocationReportRoute.get("/pdf", async (c) => {
  const filters = {
    location_id: c.req.query("location_id"),
    location_name: c.req.query("location_name"),
  };

  const data = await getFilteredStockOnHand({
    ...filters,
    limit: 1000,
  });

  const html = generateStockLocationHTML(data, filters);

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

stockLocationReportRoute.get("/excel", async (c) => {
  const filters = {
    location_id: c.req.query("location_id"),
    location_name: c.req.query("location_name"),
  };

  const data = await getFilteredStockOnHand({
    ...filters,
    limit: 1000,
  });

  const excelBuffer = await generateStockLocationExcel(data, filters);

  c.header(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  c.header("Content-Disposition", "attachment; filename=stock-movement.xlsx");
  return c.body(excelBuffer);
});
