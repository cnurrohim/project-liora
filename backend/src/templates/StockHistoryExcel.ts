import ExcelJS from "exceljs";

interface StockHistoryRow {
  item_code: string;
  item_name: string;
  period: string; // yyyy-mm-dd
  total_in: number;
  total_out: number;
  adjustment_in: number;
  adjustment_out: number;
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
    if (p === "day") return "Daily";
    if (p === "week") return "Weekly";
    return "Monthly";
  };

  sheet.addRow(["Inbound/Outbond History Report"]).font = {
    size: 14,
    bold: true,
  };
  sheet.addRow([]);
  sheet.addRow(["Period", formatPeriod(period)]);
  sheet.addRow(["From", formatDate(dateFrom)]);
  sheet.addRow(["to", formatDate(dateTo)]);
  sheet.addRow([]);

  sheet.addRow([
    "#",
    "Period",
    "Item Code",
    "Item Name",
    "Inbound",
    "Outbound",
    "Adj. In",
    "Adj. Out",
    "Balance After",
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
      r.adjustment_in,
      r.adjustment_out,
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
