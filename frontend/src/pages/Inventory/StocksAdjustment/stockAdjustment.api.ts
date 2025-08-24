import { apiFetch } from "@/utils/apiFetch";

export async function getStockAdjustments() {
  const res = await apiFetch("/inventory/stock-adjustments");
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
  if (!res.ok) throw new Error("Gagal membuat stock adjustment");
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
  if (!res.ok) throw new Error("Gagal membuat stock adjustment");
  return (await res.json()).data;
}

export async function confirmStockAdjustment(id: string) {
  const res = await apiFetch(`/inventory/stock-adjustments/${id}/confirm`, {
    method: "PATCH",
  });
  if (!res.ok) throw new Error("Gagal konfirmasi stock adjustment");
  return (await res.json()).data;
}

export async function revertStockAdjustment(id: string) {
  const res = await apiFetch(`/inventory/stock-adjustments/${id}/revert`, {
    method: "PATCH",
  });
  if (!res.ok) throw new Error("Gagal revert stock adjustment");
  return (await res.json()).data;
}

export async function cancelStockAdjustment(id: string) {
  const res = await apiFetch(`/inventory/stock-adjustments/${id}/cancel`, {
    method: "PATCH",
  });
  if (!res.ok) throw new Error("Gagal membatalkan stock adjustment");
  return (await res.json()).data;
}
