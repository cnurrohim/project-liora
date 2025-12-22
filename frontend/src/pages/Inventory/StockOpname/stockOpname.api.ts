import { apiFetch } from "@/utils/apiFetch";

function buildQueryParams(opname_number: string) {
  const params = new URLSearchParams();
  if (opname_number) params.append("opname_number", opname_number);
  if (params.size == 0) return "";
  return `?${params.toString()}`;
}

export async function getStockOpnames(opname_number: string) {
  const query = buildQueryParams(opname_number);
  const res = await apiFetch(`/inventory/stock-opnames${query}`);

  if (!res.ok) throw new Error("Gagal mengambil data stock opname");
  return (await res.json()).data;
}

export async function getStockOpnameById(id: string) {
  const res = await apiFetch(`/inventory/stock-opnames/${id}`);
  if (!res.ok) throw new Error("Gagal mengambil detail stock opname");
  return (await res.json()).data;
}

export async function getStockOpnameDetail(id: string) {
  const res = await apiFetch(`/inventory/stock-opnames/${id}/detail`);
  if (!res.ok) throw new Error("Gagal mengambil detail stock opname");
  return (await res.json()).data;
}

export async function createStockOpname(input: {
  location_id: string;
  opname_date?: string;
  notes?: string | null;
  items: {
    item_id: string;
    quantity_system: number;
    quantity_counted: number;
  }[];
}) {
  const res = await apiFetch("/inventory/stock-opnames", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to create stock opname");
  return (await res.json()).data;
}

export async function postStockOpname(id: string) {
  const res = await apiFetch(`/inventory/stock-opnames/${id}/post`, {
    method: "PATCH",
  });
  if (!res.ok) throw new Error("Gagal posting stock opname");
  return (await res.json()).data;
}

export async function updateStockOpname(
  id: string,
  input: {
    location_id: string;
    opname_date?: string;
    notes?: string | null;
    status?: "draft" | "reviewed" | "finalized" | "canceled";
    review_note?: string | null;
    items: {
      item_id: string;
      quantity_system: number;
      quantity_counted: number;
    }[];
  }
) {
  const res = await apiFetch(`/inventory/stock-opnames/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Gagal posting stock opname");
  return (await res.json()).data;
}

export async function finalizeStockOpname(id: string) {
  const res = await apiFetch(`/inventory/stock-opnames/${id}/finalize`, {
    method: "PATCH",
  });
  if (!res.ok) throw new Error("Gagal konfirmasi stock opname");
  return (await res.json()).data;
}

export async function cancelStockOpname(id: string) {
  const res = await apiFetch(`/inventory/stock-opnames/${id}/cancel`, {
    method: "PATCH",
  });
  if (!res.ok) throw new Error("Gagal membatalkan stock opname");
  return (await res.json()).data;
}
