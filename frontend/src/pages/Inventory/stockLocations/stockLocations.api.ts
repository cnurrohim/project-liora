import { apiFetch } from "@/utils/apiFetch";

export async function getStockLocations() {
  const res = await apiFetch("/inventory/stock-locations");
  if (!res.ok) throw new Error("Gagal mengambil data lokasi stock");
  const data = await res.json();
  return data.data; // backend return { data: [...] }
}

export async function getStockLocationById(id: string) {
  const res = await apiFetch(`/inventory/stock-locations/${id}`);
  if (!res.ok) throw new Error("Gagal mengambil detail lokasi stock");
  const data = await res.json();
  return data.data; // backend return { data: {...} }
}

// stockLocations.api.ts
export async function createStockLocation(input: {
  code: string;
  name: string;
  type: string;
  description?: string;
}) {
  const res = await apiFetch("/inventory/stock-locations", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Gagal membuat lokasi");
  return (await res.json()).data;
}

export async function updateStockLocation(
  id: string,
  input: {
    code: string;
    name: string;
    type: string;
    description?: string;
  }
) {
  const res = await apiFetch(`/inventory/stock-locations/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Gagal mengupdate lokasi stock");
  return (await res.json()).data;
}

export async function deleteStockLocation(id: string) {
  const res = await apiFetch(`/inventory/stock-locations/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Gagal menghapus lokasi stock");
  return (await res.json()).data;
}
