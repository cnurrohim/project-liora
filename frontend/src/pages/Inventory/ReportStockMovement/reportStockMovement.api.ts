import { apiFetch } from "@/utils/apiFetch";

export interface StockMovementFilters {
  search?: string;
  movement_type?: "inbound" | "outbound" | "adjustment";
  date_from?: string;
  date_to?: string;
}

function buildQueryParams(filters: StockMovementFilters = {}) {
  const params = new URLSearchParams();

  if (filters.search) params.append("search", filters.search);
  if (filters.movement_type)
    params.append("movement_type", filters.movement_type);
  if (filters.date_from) params.append("date_from", filters.date_from);
  if (filters.date_to) params.append("date_to", filters.date_to);

  if (params.size == 0) return "";
  return `?${params.toString()}`;
}

export async function getStockMovements(filters: StockMovementFilters = {}) {
  const query = buildQueryParams(filters);
  const res = await apiFetch(`/inventory/stock-movements${query}`);
  if (!res.ok) throw new Error("Gagal mengambil data stock movements");
  return (await res.json()).data;
}

export async function printStockMovementsPDF(
  filters: StockMovementFilters = {}
) {
  const query = buildQueryParams(filters);
  const res = await apiFetch(`/inventory/stock-movements/pdf${query}`);
  if (!res.ok) throw new Error("PDF report export failed");
  return await res.blob();
}

export async function printStockMovementsExcel(
  filters: StockMovementFilters = {}
) {
  const query = buildQueryParams(filters);
  const res = await apiFetch(`/inventory/stock-movements/excel${query}`);
  if (!res.ok) throw new Error("PDF report export failed");
  return await res.blob();
}
