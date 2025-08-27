import ExcelJS from "exceljs";

interface StockMovementRow {
  created_at: string;
  item_sku: string;
  item_name: string;
  movement_type: string;
  adjustment_direction?: string;
  qty: number;
  balance_after: number;
  source_location_name?: string;
  target_location_name?: string;
  reference_type?: string;
  note?: string;
  created_by?: string;
}

export async function generateStockMovementExcel(
  data: StockMovementRow[],
  filters: Record<string, string | undefined>
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Stock Movements");

  const { search, movement_type, date_from, date_to } = filters;

  const movementTypeLabel =
    {
      inbound: "Inbound",
      outbound: "Outbound",
      adjustment: "Adjustment",
    }[movement_type || ""] || "-";

  // Tambahkan filter di bagian atas
  sheet.addRow(["Stock Movement Report"]).font = { size: 14, bold: true };
  sheet.addRow([]); // Empty row
  sheet.addRow(["SKU", search || "-"]);
  sheet.addRow(["Tipe Pergerakan", movementTypeLabel]);
  sheet.addRow(["Dari Tanggal", date_from || "-"]);
  sheet.addRow(["Sampai Tanggal", date_to || "-"]);
  sheet.addRow([]); // Empty row

  // Header kolom
  sheet.addRow([
    "#",
    "Tanggal",
    "SKU",
    "Nama",
    "Tipe",
    "Arah",
    "Qty",
    "Saldo Setelah",
    "Lokasi Asal",
    "Lokasi Tujuan",
    "Ref Type",
    "Catatan",
    "Dibuat Oleh",
  ]);

  // Data baris
  data.forEach((r, idx) => {
    sheet.addRow([
      idx + 1,
      new Date(r.created_at).toLocaleString("id-ID"),
      r.item_sku,
      r.item_name,
      r.movement_type,
      r.adjustment_direction || "-",
      r.qty,
      r.balance_after,
      r.source_location_name || "-",
      r.target_location_name || "-",
      r.reference_type || "-",
      r.note || "-",
      r.created_by || "-",
    ]);
  });

  // Auto width
  sheet.columns.forEach((col) => {
    let maxLength = 10;
    col.eachCell?.((cell) => {
      const cellText = String(cell.value || "");
      if (cellText.length > maxLength) {
        maxLength = cellText.length;
      }
    });
    col.width = maxLength + 2;
  });

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return buffer;
}
