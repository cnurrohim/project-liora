import { apiFetch } from "@/utils/apiFetch";

export interface StockHistoryFilters {
  period?: "day" | "week" | "month";
  date_from?: string;
  date_to?: string;
}

function buildQueryParams(filters: StockHistoryFilters = {}) {
  const params = new URLSearchParams();

  if (filters.period) params.append("period", filters.period);
  if (filters.date_from) params.append("date_from", filters.date_from);
  if (filters.date_to) params.append("date_to", filters.date_to);

  if (params.size == 0) return "";
  return `?${params.toString()}`;
}

export async function getStockHistoryReports(
  filters: StockHistoryFilters = {}
) {
  const query = buildQueryParams(filters);
  const res = await apiFetch(`/inventory/stock-history-report${query}`);
  if (!res.ok) throw new Error("Gagal mengambil data riwayat masuk/keluar");
  return (await res.json()).data;
}

export async function printStockHistoryReportsPDF(
  filters: StockHistoryFilters = {}
) {
  const query = buildQueryParams(filters);
  const res = await apiFetch(`/inventory/stock-history-report/pdf${query}`);
  if (!res.ok) throw new Error("PDF report export failed");
  return await res.blob();
}

export async function printStockHistoryReportsExcel(
  filters: StockHistoryFilters = {}
) {
  const query = buildQueryParams(filters);
  const res = await apiFetch(`/inventory/stock-history-report/excel${query}`);
  if (!res.ok) throw new Error("Excel report export failed");
  return await res.blob();
}
