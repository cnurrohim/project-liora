import { apiFetch } from "@/utils/apiFetch";

export async function searchGoodsReceipts(term: string) {
  const res = await apiFetch(`/inventory/goods-receipts/${term}/search`);
  if (!res.ok) throw new Error("Pencarian goods receipt gagal");
  const data = await res.json();
  return data.data;
}

export async function searchItems(term: string) {
  const res = await apiFetch(`/inventory/items/${term}/search`);
  if (!res.ok) throw new Error("Pencarian items gagal");
  const data = await res.json();
  return data.data;
}

export async function searchItemsByLocationId(
  term: string,
  location_id: string
) {
  const res = await apiFetch(`/inventory/items/${term}/search/${location_id}`);
  if (!res.ok) throw new Error("Pencarian items gagal");
  const data = await res.json();
  return data.data;
}

export async function searchLocation(term: string) {
  const res = await apiFetch(`/inventory/stock-locations/${term}/search`);
  if (!res.ok) throw new Error("Pencarian stock locations gagal");
  const data = await res.json();
  return data.data;
}

export async function searchLocationWithItem(term: string, item_id: string) {
  const res = await apiFetch(
    `/inventory/stock-locations/${term}/search/${item_id}`
  );
  if (!res.ok) throw new Error("Pencarian stock locations gagal");
  const data = await res.json();
  return data.data;
}
