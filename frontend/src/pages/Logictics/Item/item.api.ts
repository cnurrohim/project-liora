// src/routes/item.api.ts
import { apiFetch } from "@/utils/apiFetch";

export async function getItems() {
  const res = await apiFetch("/logistics/items");
  if (!res.ok) throw new Error("Gagal mengambil data barang");
  const data = await res.json();
  return data.data; // backend return { data: [...] }
}

export async function getItemById(id: string) {
  const res = await apiFetch(`/logistics/items/${id}`);
  if (!res.ok) throw new Error("Gagal mengambil detail barang");
  const data = await res.json();
  return data.data; // backend return { data: {...} }
}

export async function createItem(input: {
  sku: string;
  name: string;
  min_stock?: number;
}) {
  const res = await apiFetch("/logistics/items", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Gagal membuat barang");
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
  const res = await apiFetch(`/logistics/items/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Gagal mengupdate barang");
  return (await res.json()).data;
}

export async function deleteItem(id: string) {
  const res = await apiFetch(`/logistics/items/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Gagal menghapus barang");
  return (await res.json()).data;
}
