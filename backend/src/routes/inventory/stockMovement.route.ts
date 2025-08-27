// src/routes/stockMovement.route.ts
import { Hono } from "hono";
import { db } from "../../db.js";
import { z } from "zod";
import puppeteer from "puppeteer";
import { generateStockMovementHTML } from "../../templates/stockMovementPDF.js";
import { generateStockMovementExcel } from "../../templates/stockMovementExcel.js";

export const stockMovementRoute = new Hono();

// Schema Zod
const stockMovementSchema = z.object({
  item_id: z.uuid(),
  movement_type: z.enum(["inbound", "outbound", "adjustment"]),
  adjustment_direction: z.enum(["increase", "decrease"]),
  qty: z.number().int().min(1),
  reference_type: z.enum([
    "purchase_order",
    "sales_order",
    "sales_return",
    "purchase_return",
    "stock_opname",
    "manual_adjustment",
  ]),
  reference_id: z.uuid().optional(),
  note: z.string().optional(),
  created_by: z.uuid(),
});

interface StockMovementQuery {
  search?: string;
  movement_type?: string;
  date_from?: string;
  date_to?: string;
  limit?: number;
}

async function getFilteredStockMovements(filters: StockMovementQuery = {}) {
  const { search, movement_type, date_from, date_to, limit = 200 } = filters;

  const params: any[] = [];
  const whereClauses: string[] = [];

  if (search) {
    params.push(`%${search}%`);
    params.push(`%${search}%`);
    whereClauses.push(
      `(i.sku ILIKE $${params.length - 1} OR i.name ILIKE $${params.length})`
    );
  }

  if (movement_type) {
    params.push(movement_type);
    whereClauses.push(`sm.movement_type = $${params.length}`);
  }

  if (date_from) {
    params.push(date_from);
    whereClauses.push(`sm.created_at >= $${params.length}`);
  }

  if (date_to) {
    params.push(date_to + " 23:59:59");
    whereClauses.push(`sm.created_at <= $${params.length}`);
  }

  const whereSQL = whereClauses.length
    ? "WHERE " + whereClauses.join(" AND ")
    : "";

  const sql = `
    SELECT sm.*, i.sku AS item_sku, i.name AS item_name,
           sls.name AS source_location_name,
           slt.name AS target_location_name,
           u.name as created_by
    FROM inventory.stock_movements sm
    JOIN inventory.items i ON sm.item_id = i.id
    JOIN public.users u ON u.id = sm.created_by
    LEFT JOIN inventory.stock_locations sls ON sm.source_location_id = sls.id
    LEFT JOIN inventory.stock_locations slt ON sm.target_location_id = slt.id
    ${whereSQL}
    ORDER BY sm.created_at DESC
    LIMIT ${limit}
  `;

  const result = await db.query(sql, params);
  return result.rows;
}

// GET /stock-movements?search=...&movement_type=...&date_from=...&date_to=...
stockMovementRoute.get("/", async (c) => {
  const data = await getFilteredStockMovements({
    search: c.req.query("search"),
    movement_type: c.req.query("movement_type"),
    date_from: c.req.query("date_from"),
    date_to: c.req.query("date_to"),
    limit: 200,
  });

  return c.json({ data });
});

stockMovementRoute.get("/pdf", async (c) => {
  const filters = {
    search: c.req.query("search"),
    movement_type: c.req.query("movement_type"),
    date_from: c.req.query("date_from"),
    date_to: c.req.query("date_to"),
  };

  const data = await getFilteredStockMovements({
    ...filters,
    limit: 1000,
  });

  const html = generateStockMovementHTML(data, filters);

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

stockMovementRoute.get("/excel", async (c) => {
  const filters = {
    search: c.req.query("search"),
    movement_type: c.req.query("movement_type"),
    date_from: c.req.query("date_from"),
    date_to: c.req.query("date_to"),
  };

  const data = await getFilteredStockMovements({
    ...filters,
    limit: 1000,
  });

  const excelBuffer = await generateStockMovementExcel(data, filters);

  c.header(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  c.header("Content-Disposition", "attachment; filename=stock-movement.xlsx");
  return c.body(excelBuffer);
});

// GET /stock-movements/:id - detail
stockMovementRoute.get("/:id", async (c) => {
  const id = c.req.param("id");
  const result = await db.query(
    `SELECT sm.*, i.sku AS item_sku, i.name AS item_name
     FROM inventory.stock_movements sm
     JOIN inventory.items i ON sm.item_id = i.id
     WHERE sm.id = $1`,
    [id]
  );
  if (!result.rows.length)
    return c.json({ error: "Stock movement not found" }, 404);
  return c.json({ data: result.rows[0] });
});

// POST /stock-movements - tambah ledger otomatis balance_after
stockMovementRoute.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const parsed = stockMovementSchema.parse(body);

    // Validasi movement_type & adjustment_direction
    if (
      (parsed.movement_type === "inbound" &&
        parsed.adjustment_direction !== "increase") ||
      (parsed.movement_type === "outbound" &&
        parsed.adjustment_direction !== "decrease")
    ) {
      return c.json(
        { error: "Kombinasi movement_type & adjustment_direction tidak valid" },
        400
      );
    }

    const client = await db.connect();
    try {
      await client.query("BEGIN");

      // Ambil saldo terakhir
      const lastResult = await client.query(
        `SELECT balance_after FROM inventory.stock_movements
         WHERE item_id=$1 ORDER BY created_at DESC LIMIT 1`,
        [parsed.item_id]
      );
      const lastBalance = lastResult.rows[0]?.balance_after ?? 0;

      // Hitung balance_after otomatis
      const balance_after =
        parsed.adjustment_direction === "increase"
          ? lastBalance + parsed.qty
          : lastBalance - parsed.qty;

      // Insert stock movement baru
      const result = await client.query(
        `INSERT INTO inventory.stock_movements
         (id, item_id, movement_type, adjustment_direction, qty, balance_after,
          reference_type, reference_id, note, created_by)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [
          parsed.item_id,
          parsed.movement_type,
          parsed.adjustment_direction,
          parsed.qty,
          balance_after,
          parsed.reference_type,
          parsed.reference_id ?? null,
          parsed.note ?? null,
          parsed.created_by,
        ]
      );

      await client.query("COMMIT");
      return c.json({ data: result.rows[0] });
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error("Insert stock movement error:", err);
    if (err instanceof z.ZodError) return c.json({ error: err.flatten() }, 400);
    return c.json({ error: "Gagal menambahkan stock movement" }, 400);
  }
});

// DELETE /stock-movements/:id
stockMovementRoute.delete("/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const result = await db.query(
      "DELETE FROM inventory.stock_movements WHERE id=$1 RETURNING *",
      [id]
    );
    if (!result.rows.length)
      return c.json({ error: "Stock movement not found" }, 404);
    return c.json({ data: result.rows[0] });
  } catch (err) {
    console.error("Delete stock movement error:", err);
    return c.json({ error: "Gagal menghapus stock movement" }, 400);
  }
});
