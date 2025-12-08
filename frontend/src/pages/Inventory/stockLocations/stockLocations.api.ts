import { apiFetch } from "@/utils/apiFetch";

export async function getStockLocations() {
  const res = await apiFetch("/inventory/stock-locations");
  if (!res.ok) throw new Error("failed to fecth inventory location");
  const data = await res.json();
  return data.data; // backend return { data: [...] }
}

export async function getStockLocationById(id: string) {
  const res = await apiFetch(`/inventory/stock-locations/${id}`);
  if (!res.ok) throw new Error("Failed to fetch inventory location details");
  const data = await res.json();
  return data.data; // backend return { data: {...} }
}

// stockLocations.api.ts
export async function createStockLocation(input: {
  code: string;
  name: string;
  description?: string;
}) {
  const res = await apiFetch("/inventory/stock-locations", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to create inventory location");
  return (await res.json()).data;
}

export async function updateStockLocation(
  id: string,
  input: {
    code: string;
    name: string;
    description?: string;
  }
) {
  const res = await apiFetch(`/inventory/stock-locations/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed updating inventory location");
  return (await res.json()).data;
}

export async function deleteStockLocation(id: string) {
  const res = await apiFetch(`/inventory/stock-locations/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed deleting inventory location");
  return (await res.json()).data;
}
