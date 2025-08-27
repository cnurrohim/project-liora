// src/api/inventory/stockLocationReport.ts
import { apiFetch } from "@/utils/apiFetch";

export interface StockLocationFilters {
  location_id?: string;
  location_name?: string;
}

function buildStockLocationQueryParams(filters: StockLocationFilters = {}) {
  const params = new URLSearchParams();

  if (filters.location_id) params.append("location_id", filters.location_id);
  if (filters.location_name)
    params.append("location_name", filters.location_name);

  return params.toString();
}

export async function getStockLocationReports(
  filters: StockLocationFilters = {}
) {
  const query = buildStockLocationQueryParams(filters);
  const res = await apiFetch(
    `/inventory/stock-location-report${query ? `?${query}` : ""}`
  );
  if (!res.ok) throw new Error("Gagal mengambil data stock per location");
  return (await res.json()).data;
}

export async function printStockLocationReportsPDF(
  filters: StockLocationFilters = {}
) {
  const query = buildStockLocationQueryParams(filters);
  const res = await apiFetch(
    `/inventory/stock-location-report/pdf${query ? `?${query}` : ""}`
  );
  if (!res.ok) throw new Error("Gagal download PDF");
  return await res.blob();
}

export async function printStockLocationReportsExcel(
  filters: StockLocationFilters = {}
) {
  const query = buildStockLocationQueryParams(filters);
  const res = await apiFetch(
    `/inventory/stock-location-report/excel${query ? `?${query}` : ""}`
  );
  if (!res.ok) throw new Error("Gagal download Excel");
  return await res.blob();
}
