import { apiFetch } from "@/utils/apiFetch";

function buildQueryParams(adjustment_number: string) {
  const params = new URLSearchParams();
  if (adjustment_number) params.append("adjustment_number", adjustment_number);
  if (params.size == 0) return "";
  return `?${params.toString()}`;
}

export async function getStockAdjustments(adjustment_number: string) {
  const query = buildQueryParams(adjustment_number);
  const res = await apiFetch(`/inventory/stock-adjustments${query}`);

  if (!res.ok) throw new Error("Gagal mengambil data stock adjustment");
  return (await res.json()).data;
}

export async function getStockAdjustmentById(id: string) {
  const res = await apiFetch(`/inventory/stock-adjustments/${id}`);
  if (!res.ok) throw new Error("Gagal mengambil detail stock adjustment");
  return (await res.json()).data;
}

export async function getStockAdjustmentDetail(id: string) {
  const res = await apiFetch(`/inventory/stock-adjustments/${id}/detail`);
  if (!res.ok) throw new Error("Gagal mengambil detail stock adjustment");
  return (await res.json()).data;
}

export async function createStockAdjustment(input: {
  adjustment_date?: string;
  reason?: string | null;
  items: {
    item_id: string;
    location_id: string;
    quantity_before: number;
    quantity_diff: number;
    notes?: string | null;
  }[];
}) {
  const res = await apiFetch("/inventory/stock-adjustments", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to create stock adjustment");
  return (await res.json()).data;
}

export async function updateStockAdjustment(
  id: string,
  input: {
    adjustment_date?: string;
    reason?: string | null;
    items: {
      item_id: string;
      location_id: string;
      quantity_before: number;
      quantity_diff: number;
      notes?: string | null;
    }[];
  }
) {
  const res = await apiFetch(`/inventory/stock-adjustments/${id}/update`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to create stock adjustment");
  return (await res.json()).data;
}

export async function confirmStockAdjustment(id: string) {
  const res = await apiFetch(`/inventory/stock-adjustments/${id}/confirm`, {
    method: "PATCH",
  });
  if (!res.ok) throw new Error("Failed approving stock adjustment");
  return (await res.json()).data;
}

export async function revertStockAdjustment(id: string) {
  const res = await apiFetch(`/inventory/stock-adjustments/${id}/revert`, {
    method: "PATCH",
  });
  if (!res.ok) throw new Error("Failed reverting stock adjustment");
  return (await res.json()).data;
}

export async function cancelStockAdjustment(id: string) {
  const res = await apiFetch(`/inventory/stock-adjustments/${id}/cancel`, {
    method: "PATCH",
  });
  if (!res.ok) throw new Error("Failed Cenceling stock adjustment");
  return (await res.json()).data;
}
