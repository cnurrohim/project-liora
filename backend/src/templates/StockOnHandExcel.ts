import ExcelJS from "exceljs";

interface StockOnHandRow {
  item_code: string;
  item_name: string;
  location: string;
  current_qty: number;
  last_movement: string | null;
}

export async function generateStockOnHandExcel(
  data: StockOnHandRow[],
  filters: Record<string, string | undefined>
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Inventory On Hand");

  const { search, location_name } = filters;

  // Tambahkan filter di bagian atas
  sheet.addRow(["Inventory On Hand Report"]).font = { size: 14, bold: true };
  sheet.addRow([]); // Empty row
  sheet.addRow(["SKU", search || "-"]);
  sheet.addRow(["Location", location_name || "-"]);
  sheet.addRow([]); // Empty row

  // Header kolom
  sheet.addRow([
    "#",
    "SKU",
    "Item Name",
    "Location",
    "Current Quantity",
    "Last Movement",
  ]);

  // Data baris
  data.forEach((r, idx) => {
    sheet.addRow([
      idx + 1,
      r.item_code,
      r.item_name,
      r.location,
      r.current_qty,
      r.last_movement ? new Date(r.last_movement).toLocaleString("id-ID") : "-",
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
