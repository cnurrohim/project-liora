import { Hono } from "hono";
import { db } from "../../db.js";
import { generateStockHistoryHTML } from "../../templates/StockHistoryPDF.js";
import puppeteer from "puppeteer";
import { generateStockHistoryExcel } from "../../templates/StockHistoryExcel.js";

export const stockHistoryReportRoute = new Hono();

interface StockHistory {
  period?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
}

async function getFilteredStockHistory(filters: StockHistory = {}) {
  const { period, dateFrom, dateTo, limit = 200 } = filters;

  const params: any[] = [];
  const whereClauses: string[] = [];

  if (dateFrom) {
    params.push(dateFrom);
    whereClauses.push(`sm.created_at >= $${params.length}`);
  }
  if (dateTo) {
    params.push(dateTo + " 23:59:59");
    whereClauses.push(`sm.created_at <= $${params.length}`);
  }

  whereClauses.push(`sm.movement_type IN ('inbound', 'outbound')`);

  const whereSQL = whereClauses.length
    ? "WHERE " + whereClauses.join(" AND ")
    : "";

  const sql = `
    SELECT 
      i.sku AS item_code,
      i.name AS item_name,
      DATE_TRUNC('${period}', sm.created_at)::date AS period,
      SUM(CASE WHEN sm.movement_type = 'inbound' THEN sm.qty ELSE 0 END) AS total_in,
      SUM(CASE WHEN sm.movement_type = 'outbound' THEN sm.qty ELSE 0 END) AS total_out,
      MAX(sm.balance_after) AS closing_balance
    FROM inventory.stock_movements sm
    JOIN inventory.items i ON sm.item_id = i.id
    ${whereSQL}
    GROUP BY i.sku, i.name, DATE_TRUNC('${period}', sm.created_at)
    ORDER BY i.sku, period DESC
    LIMIT ${limit}
  `;

  const result = await db.query(sql, params);
  return result.rows;
}

stockHistoryReportRoute.get("/", async (c) => {
  const filters = {
    period: c.req.query("period") || "month",
    dateFrom: c.req.query("date_from"),
    dateTo: c.req.query("date_to"),
  };

  const data = await getFilteredStockHistory({
    ...filters,
    limit: 1000,
  });

  return c.json({ data });
});

stockHistoryReportRoute.get("/pdf", async (c) => {
  const filters = {
    period: c.req.query("period") || "month",
    dateFrom: c.req.query("date_from"),
    dateTo: c.req.query("date_to"),
  };

  const data = await getFilteredStockHistory({
    ...filters,
    limit: 1000,
  });

  const html = generateStockHistoryHTML(data, filters);

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

stockHistoryReportRoute.get("/excel", async (c) => {
  const filters = {
    period: c.req.query("period") || "month",
    dateFrom: c.req.query("date_from"),
    dateTo: c.req.query("date_to"),
  };

  const data = await getFilteredStockHistory({
    ...filters,
    limit: 1000,
  });

  const excelBuffer = await generateStockHistoryExcel(data, filters);

  c.header(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  c.header("Content-Disposition", "attachment; filename=stock-movement.xlsx");
  return c.body(excelBuffer);
});
