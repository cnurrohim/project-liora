import { apiFetch } from "@/utils/apiFetch";

export interface StockOnHandFilters {
  search?: string;
  location_id?: string;
  location_name?: string;
}

function buildQueryParams(filters: StockOnHandFilters = {}) {
  const params = new URLSearchParams();

  if (filters.search) params.append("search", filters.search);
  if (filters.location_id) params.append("location_id", filters.location_id);
  if (filters.location_name)
    params.append("location_name", filters.location_name);

  if (params.size == 0) return "";
  return `?${params.toString()}`;
}

export async function getStockOnHands(filters: StockOnHandFilters = {}) {
  const query = buildQueryParams(filters);
  const res = await apiFetch(`/inventory/stock-on-hand${query}`);
  if (!res.ok) throw new Error("Gagal mengambil data stock on hand");
  return (await res.json()).data;
}

export async function printStockOnHandsPDF(filters: StockOnHandFilters = {}) {
  const query = buildQueryParams(filters);
  const res = await apiFetch(`/inventory/stock-on-hand/pdf${query}`);
  if (!res.ok) throw new Error("PDF report export failed");
  return await res.blob();
}

export async function printStockOnHandsExcel(filters: StockOnHandFilters = {}) {
  const query = buildQueryParams(filters);
  const res = await apiFetch(`/inventory/stock-on-hand/excel${query}`);
  if (!res.ok) throw new Error("Excel report export failed");
  return await res.blob();
}
