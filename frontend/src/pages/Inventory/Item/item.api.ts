import { apiFetch } from "@/utils/apiFetch";

export async function getItems() {
  const res = await apiFetch("/inventory/items");
  if (!res.ok) throw new Error("Failed to fetch inventory item list");
  const data = await res.json();
  return data.data;
}

export async function getItemDetails(term?: string) {
  const q = term ? `?term=${encodeURIComponent(term)}` : "";
  const res = await apiFetch(`/inventory/item-details${q}`);
  if (!res.ok) throw new Error("Failed to fetch inventory item details");
  const data = await res.json();
  return data.data;
}

export async function printItemDetailsPDF(term?: string) {
  const q = term ? `?term=${encodeURIComponent(term)}` : "";
  const res = await apiFetch(`/inventory/item-details/pdf?${q}`);
  if (!res.ok) throw new Error("PDF report export failed");
  return await res.blob();
}

export async function printItemDetailsExcel(term?: string) {
  const q = term ? `?term=${encodeURIComponent(term)}` : "";
  const res = await apiFetch(`/inventory/item-details/excel?${q}`);
  if (!res.ok) throw new Error("EXcel report export failed");
  return await res.blob();
}

export async function getItemById(id: string) {
  const res = await apiFetch(`/inventory/items/${id}`);
  if (!res.ok) throw new Error("Failed to fetch inventory item");
  const data = await res.json();
  return data.data;
}

export async function createItem(input: {
  sku: string;
  name: string;
  min_stock?: number;
}) {
  const res = await apiFetch("/inventory/items", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to create item");
  return (await res.json()).data;
}

export async function updateItem(
  id: string,
  input: {
    sku: string;
    name: string;
    min_stock?: number;
  }
) {
  const res = await apiFetch(`/inventory/items/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed updating item");
  return (await res.json()).data;
}

export async function deleteItem(id: string) {
  const res = await apiFetch(`/inventory/items/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed deleting item");
  return (await res.json()).data;
}
