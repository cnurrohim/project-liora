// src/routes/goodsReceipt.api.ts
import { apiFetch } from "@/utils/apiFetch";

// ambil semua goods receipts
export async function getGoodsReceipts() {
  const res = await apiFetch("/logistics/goods-receipts");
  if (!res.ok) throw new Error("Gagal mengambil data goods receipt");
  const data = await res.json();
  return data.data;
}

// ambil goods receipt by ID
export async function getGoodsReceiptById(id: string) {
  const res = await apiFetch(`/logistics/goods-receipts/${id}`);
  if (!res.ok) throw new Error("Gagal mengambil detail goods receipt");
  const data = await res.json();
  return data.data;
}

// search goods receipt
export async function searchGoodsReceipts(term: string) {
  const res = await apiFetch(`/logistics/goods-receipts/${term}/search`);
  if (!res.ok) throw new Error("Pencarian goods receipt gagal");
  const data = await res.json();
  return data.data;
}

// ambil goods receipt detail (header + items)
export async function getGoodsReceiptDetail(id: string) {
  const res = await apiFetch(`/logistics/goods-receipts/${id}/detail`);
  if (!res.ok)
    throw new Error("Gagal mengambil informasi detail goods receipt");
  return (await res.json()).data;
}

// buat goods receipt baru (tanpa PO)
export async function createGoodsReceipt(input: {
  supplier_id: string;
  receipt_date?: string;
  notes?: string | null;
  items: {
    item_id: string;
    quantity: number;
    notes?: string | null;
  }[];
}) {
  const res = await apiFetch("/logistics/goods-receipts", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Gagal membuat goods receipt");
  return (await res.json()).data;
}

// update goods receipt
export async function updateGoodsReceipt(
  id: string,
  input: {
    supplier_id: string;
    receipt_date?: string;
    notes?: string | null;
    items: {
      item_id: string;
      quantity: number;
      notes?: string | null;
    }[];
  }
) {
  const res = await apiFetch(`/logistics/goods-receipts/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Gagal mengupdate goods receipt");
  return (await res.json()).data;
}

// hapus goods receipt
export async function deleteGoodsReceipt(id: string) {
  const res = await apiFetch(`/logistics/goods-receipts/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Gagal menghapus goods receipt");
  return (await res.json()).data;
}
