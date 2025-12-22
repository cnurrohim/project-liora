import { Hono } from "hono";
import { db } from "../../db.js";
import puppeteer from "puppeteer";
import { generatePOSummaryHTML } from "../../templates/POSummaryPDF.js";
import { generatePOSummaryExcel } from "../../templates/POSummaryExcel.js";
import { createExcel, createPDF } from "../../utils/reportCreator.js";

export const poSummaryRoute = new Hono();

interface StockOnHand {
  from?: string;
  to?: string;
  status?: string;
  limit?: number;
}

async function getFilteredPOSummary(filters: StockOnHand = {}) {
  const { from, to, status } = filters;

  const params: any[] = [];
  const whereClauses: string[] = [];

  if (from) {
    params.push(from);
    whereClauses.push(`po.order_date >= $${params.length}`);
  }
  if (to) {
    params.push(to);
    whereClauses.push(`po.order_date <= $${params.length}`);
  }

  if (status === "Open") {
    whereClauses.push(
      ` po.status <> 'cancelled' AND COALESCE(rt.total_received, 0) = 0`
    );
  } else if (status === "Partial") {
    whereClauses.push(
      ` po.status <> 'cancelled'
  AND COALESCE(rt.total_received, 0) > 0
  AND COALESCE(rt.total_received, 0) < pt.total_ordered`
    );
  } else if (status === "Received") {
    whereClauses.push(
      ` po.status <> 'cancelled' AND COALESCE(rt.total_received, 0) >= pt.total_ordered`
    );
  } else if (status === "Cancelled") {
    whereClauses.push(` po.status = 'cancelled'`);
  }

  const whereSQL = whereClauses.length
    ? "WHERE po.deleted_at is null AND " + whereClauses.join(" AND ")
    : "WHERE po.deleted_at is null ";

  const sql = `WITH po_totals AS (
                SELECT
                  purchase_order_id,
                  SUM(qty) AS total_ordered,
                  COUNT(*) AS total_items
                FROM inventory.purchase_order_items
                GROUP BY purchase_order_id
              ),

              received_totals AS (
                SELECT
                  pr.purchase_order_id,
                  SUM(pri.qty) AS total_received
                FROM inventory.purchase_receives pr
                JOIN inventory.purchase_receive_items pri
                  ON pri.purchase_receive_id = pr.id
                GROUP BY pr.purchase_order_id
              )

              SELECT
                po.order_number AS po_no,
                s.name AS supplier,
                po.order_date,
                po.expected_date,
                pt.total_items,

                ROUND(
                  (COALESCE(rt.total_received, 0)::numeric
                  / NULLIF(pt.total_ordered, 0)) * 100,
                  2
                ) AS received_percent,

                CASE
                  WHEN po.status = 'cancelled' THEN 'Cancelled'
                  WHEN COALESCE(rt.total_received, 0) = 0 THEN 'Open'
                  WHEN COALESCE(rt.total_received, 0) < pt.total_ordered THEN 'Partial'
                  WHEN COALESCE(rt.total_received, 0) >= pt.total_ordered THEN 'Received'
                  ELSE 'Open'
                END AS status

              FROM inventory.purchase_orders po
              JOIN inventory.suppliers s
                ON s.id = po.supplier_id
              JOIN po_totals pt
                ON pt.purchase_order_id = po.id
              LEFT JOIN received_totals rt
                ON rt.purchase_order_id = po.id

              ${whereSQL}
              ORDER BY po.order_date DESC`;

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

poSummaryRoute.get(
  "/pdf",
  createPDF({
    filename: "po-summary",
    getFilters: (c) => ({
      from: c.req.query("from") || "",
      to: c.req.query("to") || "",
      status: c.req.query("status") || "",
    }),
    getData: (filters) => getFilteredPOSummary({ ...filters, limit: 1000 }),
    buildHTML: generatePOSummaryHTML,
  })
);

poSummaryRoute.get(
  "/excel",
  createExcel({
    filename: "po-summary",
    getFilters: (c) => ({
      from: c.req.query("from") || "",
      to: c.req.query("to") || "",
      status: c.req.query("status") || "",
    }),
    getData: (filters) => getFilteredPOSummary({ ...filters, limit: 1000 }),
    buildExcel: generatePOSummaryExcel,
  })
);
