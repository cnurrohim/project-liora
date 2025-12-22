import { Hono } from "hono";
import { db } from "../../db.js";
import { generateStockHistoryHTML } from "../../templates/StockHistoryPDF.js";
import puppeteer from "puppeteer";
import { generateStockHistoryExcel } from "../../templates/StockHistoryExcel.js";
import { createExcel, createPDF } from "../../utils/reportCreator.js";

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

  whereClauses.push(
    `sm.movement_type IN ('inbound', 'outbound', 'adjustment')`
  );

  const whereSQL = whereClauses.length
    ? "WHERE " + whereClauses.join(" AND ")
    : "";

  const sql = `WITH final_tx AS (
  SELECT DISTINCT ON (i.sku, DATE_TRUNC('${period}', sm.created_at))
    i.sku,
    i.name,
    DATE_TRUNC('${period}', sm.created_at)::date AS period,
    sm.balance_after
  FROM inventory.stock_movements sm
  JOIN inventory.items i ON sm.item_id = i.id
  ${whereSQL}
  ORDER BY i.sku, DATE_TRUNC('${period}', sm.created_at), sm.created_at DESC, sm.id DESC
)
SELECT
  i.sku AS item_code,
  i.name AS item_name,
  ft.period,
  SUM(CASE WHEN sm.movement_type='inbound' THEN sm.qty ELSE 0 END) AS total_in,
  SUM(CASE WHEN sm.movement_type='outbound' THEN sm.qty ELSE 0 END) AS total_out,
  SUM(
    CASE
      WHEN sm.movement_type = 'adjustment'
       AND sm.adjustment_direction = 'increase'
      THEN sm.qty ELSE 0
    END
  ) AS adjustment_in,

  SUM(
    CASE
      WHEN sm.movement_type = 'adjustment'
       AND sm.adjustment_direction = 'decrease'
      THEN sm.qty ELSE 0
    END
  ) AS adjustment_out,
  ft.balance_after AS closing_balance
FROM inventory.stock_movements sm
JOIN inventory.items i ON sm.item_id = i.id
JOIN final_tx ft ON ft.sku = i.sku AND ft.period = DATE_TRUNC('${period}', sm.created_at)::date 
${whereSQL}
GROUP BY i.sku, i.name, period, ft.balance_after
ORDER BY period DESC
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

stockHistoryReportRoute.get(
  "/pdf",
  createPDF({
    filename: "inventory-history",
    getFilters: (c) => ({
      period: c.req.query("period") || "month",
      dateFrom: c.req.query("date_from"),
      dateTo: c.req.query("date_to"),
    }),
    getData: (filters) => getFilteredStockHistory({ ...filters, limit: 1000 }),
    buildHTML: generateStockHistoryHTML,
  })
);

stockHistoryReportRoute.get(
  "/excel",
  createExcel({
    filename: "inventory-history",
    getFilters: (c) => ({
      period: c.req.query("period") || "month",
      dateFrom: c.req.query("date_from"),
      dateTo: c.req.query("date_to"),
    }),
    getData: (filters) => getFilteredStockHistory({ ...filters, limit: 1000 }),
    buildExcel: generateStockHistoryExcel,
  })
);
