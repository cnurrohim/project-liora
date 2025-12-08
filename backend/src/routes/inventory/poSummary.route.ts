import { Hono } from "hono";
import { db } from "../../db.js";
import puppeteer from "puppeteer";
import { generatePOSummaryHTML } from "../../templates/POSummaryPDF.js";
import { generatePOSummaryExcel } from "../../templates/POSummaryExcel.js";

export const poSummaryRoute = new Hono();

interface StockOnHand {
  from?: string;
  to?: string;
  status?: string;
  limit?: number;
}

async function getFilteredPOSummary(filters: StockOnHand = {}) {
  const { from, to, status, limit = 200 } = filters;

  const params: any[] = [];
  const whereClauses: string[] = [];
  const havingClauses: string[] = [];

  if (from) {
    params.push(from);
    whereClauses.push(`po.order_date >= $${params.length}`);
  }
  if (to) {
    params.push(to);
    whereClauses.push(`po.order_date <= $${params.length}`);
  }

  const whereSQL = whereClauses.length
    ? "WHERE " + whereClauses.join(" AND ")
    : "";

  if (status === "Open") {
    havingClauses.push(`SUM(poi.received_qty) = 0`);
  } else if (status === "Partial") {
    havingClauses.push(
      `SUM(poi.received_qty) > 0 AND SUM(poi.received_qty) < SUM(poi.qty)`
    );
  } else if (status === "Received") {
    havingClauses.push(`SUM(poi.received_qty) = SUM(poi.qty)`);
  }

  const havingSQL = havingClauses.length
    ? "HAVING " + havingClauses.join(" AND ")
    : "";

  const sql = `
    SELECT 
      po.order_number AS po_no,
      s.name AS supplier,
      po.order_date,
      po.expected_date,
      COUNT(poi.id) AS total_items,
      ROUND(
        (SUM(poi.received_qty)::numeric / NULLIF(SUM(poi.qty),0)) * 100, 
        2
      ) AS received_percent,
      CASE
        WHEN po.status = 'cancelled' then 'Cancelled'
        WHEN SUM(poi.received_qty) = 0 THEN 'Open'
        WHEN SUM(poi.received_qty) < SUM(poi.qty) THEN 'Partial'
        WHEN SUM(poi.received_qty) = SUM(poi.qty) THEN 'Received'
        ELSE 'Open'
      END AS status
    FROM inventory.purchase_orders po
    JOIN inventory.suppliers s ON po.supplier_id = s.id
    JOIN inventory.purchase_order_items poi ON poi.purchase_order_id = po.id
    ${whereSQL}
    GROUP BY po.id, po.order_number, s.name, po.order_date, po.expected_date
    ${havingSQL}
    ORDER BY po.order_date DESC
    LIMIT ${limit}
  `;

  const result = await db.query(sql, params);
  return result.rows;
}

poSummaryRoute.get("/", async (c) => {
  const filters = {
    from: c.req.query("from") || "",
    to: c.req.query("to") || "",
    status: c.req.query("status") || "",
  };

  const data = await getFilteredPOSummary({
    ...filters,
    limit: 1000,
  });

  return c.json({ data });
});

poSummaryRoute.get("/pdf", async (c) => {
  const filters = {
    from: c.req.query("from") || "",
    to: c.req.query("to") || "",
    status: c.req.query("status") || "",
  };

  const data = await getFilteredPOSummary({
    ...filters,
    limit: 1000,
  });

  const html = generatePOSummaryHTML(data, filters);

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

poSummaryRoute.get("/excel", async (c) => {
  const filters = {
    from: c.req.query("from") || "",
    to: c.req.query("to") || "",
    status: c.req.query("status") || "",
  };

  const data = await getFilteredPOSummary({
    ...filters,
    limit: 1000,
  });

  const excelBuffer = await generatePOSummaryExcel(data, filters);

  c.header(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  c.header("Content-Disposition", "attachment; filename=stock-movement.xlsx");
  return c.body(excelBuffer);
});
