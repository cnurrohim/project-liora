import { apiFetch } from "@/utils/apiFetch";

export interface POSummaryFilters {
  from?: string;
  to?: string;
  status?: string; // "Open" | "Partial" | "Received"
}

function buildPOSummaryQueryParams(filters: POSummaryFilters = {}) {
  const params = new URLSearchParams();

  if (filters.from) params.append("from", filters.from);
  if (filters.to) params.append("to", filters.to);
  if (filters.status) params.append("status", filters.status);

  return params.toString();
}

export async function getPOSummaryReports(filters: POSummaryFilters = {}) {
  const query = buildPOSummaryQueryParams(filters);
  const res = await apiFetch(
    `/inventory/po-summary${query ? `?${query}` : ""}`
  );
  if (!res.ok) throw new Error("Gagal mengambil data PO Summary");
  return (await res.json()).data;
}

export async function printPOSummaryReportsPDF(filters: POSummaryFilters = {}) {
  const query = buildPOSummaryQueryParams(filters);
  const res = await apiFetch(
    `/inventory/po-summary/pdf${query ? `?${query}` : ""}`
  );
  if (!res.ok) throw new Error("PDF report export failed PO Summary");
  return await res.blob();
}

export async function printPOSummaryReportsExcel(
  filters: POSummaryFilters = {}
) {
  const query = buildPOSummaryQueryParams(filters);
  const res = await apiFetch(
    `/inventory/po-summary/excel${query ? `?${query}` : ""}`
  );
  if (!res.ok) throw new Error("Excel report export failed PO Summary");
  return await res.blob();
}
