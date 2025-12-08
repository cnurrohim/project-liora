import ExcelJS from "exceljs";

interface Data {
  id: string;
  sku: string;
  name: string;
  min_stock: number;
  locations?: Record<string, number>;
}

interface Locations {
  id: string;
  code: string;
  name: string;
  type: string;
  description: string | null;
}

export async function generateInventoryDetailsExcel(
  data: Data[],
  locations: Locations[]
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Inventory per Location");

  // 🔹 Header Laporan
  sheet.addRow(["Inventory Item per Location"]).font = {
    size: 14,
    bold: true,
  };

  const locationHeaders = locations.map((loc) => `${loc.code} - ${loc.name}`);

  const header = ["#", "SKU", "Inventory Item", ...locationHeaders, "Total"];

  // 🔹 Header Tabel
  sheet.addRow(header).font = { bold: true };

  // 🔹 Data Baris
  data.forEach((row, idx) => {
    const qtyItemAlllocations = row.locations || {};
    const total = Object.values(qtyItemAlllocations).reduce(
      (sum, v) => sum + (v ?? 0),
      0
    );

    const qtyPerLocations = locations.map((loc) => {
      const qty = row.locations?.[loc.id] ?? 0;
      return qty;
    });

    sheet.addRow([idx + 1, row.sku, row.name, ...qtyPerLocations, total]);
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
