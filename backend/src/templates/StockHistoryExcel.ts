import ExcelJS from "exceljs";

interface StockHistoryRow {
  item_code: string;
  item_name: string;
  period: string; // yyyy-mm-dd
  total_in: number;
  total_out: number;
  closing_balance: number;
}

export async function generateStockHistoryExcel(
  data: StockHistoryRow[],
  filters: {
    period?: string;
    dateFrom?: string;
    dateTo?: string;
  }
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Inventory History");

  const { period, dateFrom, dateTo } = filters;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID");
  };

  const formatPeriod = (p?: string) => {
    if (p === "day") return "Harian";
    if (p === "week") return "Mingguan";
    return "Bulanan";
  };

  // 🔹 Tambahkan judul dan filter
  sheet.addRow(["Laporan Riwayat Masuk / Keluar"]).font = {
    size: 14,
    bold: true,
  };
  sheet.addRow([]); // Empty row
  sheet.addRow(["Periode", formatPeriod(period)]);
  sheet.addRow(["Dari", formatDate(dateFrom)]);
  sheet.addRow(["Sampai", formatDate(dateTo)]);
  sheet.addRow([]); // Empty row

  // 🔹 Header kolom
  sheet.addRow([
    "#",
    "Periode",
    "Kode Barang",
    "Nama Barang",
    "Masuk",
    "Keluar",
    "Saldo Akhir",
  ]).font = { bold: true };

  // 🔹 Data baris
  data.forEach((r, idx) => {
    sheet.addRow([
      idx + 1,
      new Date(r.period).toLocaleDateString("id-ID"),
      r.item_code,
      r.item_name,
      r.total_in,
      r.total_out,
      r.closing_balance,
    ]);
  });

  // 🔹 Auto width
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
  return Buffer.from(arrayBuffer);
}
