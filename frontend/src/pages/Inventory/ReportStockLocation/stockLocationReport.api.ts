import { apiFetch } from "@/utils/apiFetch";

export interface StockLocationFilters {
  location_id?: string;
  location_name?: string;
}

function buildQueryParams(filters: StockLocationFilters = {}) {
  const params = new URLSearchParams();

  if (filters.location_id) params.append("location_id", filters.location_id);
  if (filters.location_name)
    params.append("location_name", filters.location_name);

  if (params.size == 0) return "";
  return `?${params.toString()}`;
}

export async function getStockLocationReports(
  filters: StockLocationFilters = {}
) {
  const query = buildQueryParams(filters);
  const res = await apiFetch(`/inventory/stock-location-report${query}`);
  if (!res.ok) throw new Error("Failed to fetch data inventory per location");
  return (await res.json()).data;
}

export async function printStockLocationReportsPDF(
  filters: StockLocationFilters = {}
) {
  const query = buildQueryParams(filters);
  const res = await apiFetch(`/inventory/stock-location-report/pdf${query}`);
  if (!res.ok) throw new Error("PDF report export failed");
  return await res.blob();
}

export async function printStockLocationReportsExcel(
  filters: StockLocationFilters = {}
) {
  const query = buildQueryParams(filters);
  const res = await apiFetch(`/inventory/stock-location-report/excel${query}`);
  if (!res.ok) throw new Error("Excel report export failed");
  return await res.blob();
}
