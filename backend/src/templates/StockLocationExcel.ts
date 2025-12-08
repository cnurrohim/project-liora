import ExcelJS from "exceljs";

interface StockLocationRow {
  location: string;
  total_item_types: number;
  total_qty: number;
  last_update?: string | null;
}

export async function generateStockLocationExcel(
  data: StockLocationRow[],
  filters: Record<string, string | undefined>
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Inventory per Location");

  const { location_name } = filters;

  // 🔹 Header Laporan
  sheet.addRow(["Inventory Report per Location"]).font = {
    size: 14,
    bold: true,
  };
  sheet.addRow([]); // Empty row
  sheet.addRow(["Location", location_name || "-"]);
  sheet.addRow([]); // Empty row

  // 🔹 Header Tabel
  sheet.addRow([
    "#",
    "Location",
    "Quantity per Item Type",
    "Total Quantity",
    "Last Updated",
  ]).font = { bold: true };

  // 🔹 Data Baris
  data.forEach((row, idx) => {
    sheet.addRow([
      idx + 1,
      row.location,
      row.total_item_types,
      row.total_qty,
      row.last_update ? new Date(row.last_update).toLocaleString("id-ID") : "-",
    ]);
  });

  // 🔹 Auto Width Columns
  sheet.columns.forEach((col) => {
    let maxLength = 10;
    col.eachCell?.((cell) => {
      const val = String(cell.value || "");
      if (val.length > maxLength) maxLength = val.length;
    });
    col.width = maxLength + 2;
  });

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}
