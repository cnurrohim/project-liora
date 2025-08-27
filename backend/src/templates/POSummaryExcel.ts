import ExcelJS from "exceljs";

interface POSummaryRow {
  po_no: string;
  supplier: string;
  order_date: string;
  expected_date: string;
  total_items: number;
  received_percent: number;
  status: "Open" | "Partial" | "Received";
}

export async function generatePOSummaryExcel(
  data: POSummaryRow[],
  filters: Record<string, string | undefined>
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("PO Summary");

  const { from, to, status } = filters;

  // 🔹 Judul dan Filter di bagian atas
  sheet.addRow(["Purchase Order Summary"]).font = { size: 14, bold: true };
  sheet.addRow([]); // Empty row
  sheet.addRow(["Dari", from || "-"]);
  sheet.addRow(["Sampai", to || "-"]);
  sheet.addRow(["Status", status || "Semua"]);
  sheet.addRow([]); // Empty row

  // 🔹 Header kolom
  sheet.addRow([
    "#",
    "PO No",
    "Supplier",
    "Tanggal Order",
    "Tanggal Estimasi",
    "Total Item",
    "Progress (%)",
    "Status",
  ]);

  // 🔹 Isi data baris
  data.forEach((r, idx) => {
    sheet.addRow([
      idx + 1,
      r.po_no,
      r.supplier,
      new Date(r.order_date).toLocaleDateString("id-ID"),
      new Date(r.expected_date).toLocaleDateString("id-ID"),
      r.total_items,
      r.received_percent,
      r.status,
    ]);
  });

  // 🔹 Auto width kolom
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

  // 🔹 Buffer ke XLSX
  const arrayBuffer = await workbook.xlsx.writeBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return buffer;
}
