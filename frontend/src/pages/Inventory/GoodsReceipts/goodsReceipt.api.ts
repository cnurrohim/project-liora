import { apiFetch } from "@/utils/apiFetch";

function buildQueryParams(receipt_number: string) {
  const params = new URLSearchParams();
  if (receipt_number) params.append("receipt_number", receipt_number);
  if (params.size == 0) return "";
  return `?${params.toString()}`;
}

// ambil semua goods receipts
export async function getGoodsReceipts(receipt_number: string) {
  const query = buildQueryParams(receipt_number);
  const res = await apiFetch(`/inventory/goods-receipts${query}`);

  if (!res.ok) throw new Error("Gagal mengambil data goods receipt");
  const data = await res.json();
  return data.data;
}

// ambil goods receipt by ID
export async function getGoodsReceiptById(id: string) {
  const res = await apiFetch(`/inventory/goods-receipts/${id}`);
  if (!res.ok) throw new Error("Gagal mengambil detail goods receipt");
  const data = await res.json();
  return data.data;
}

// ambil goods receipt detail (header + items)
export async function getGoodsReceiptDetail(id: string) {
  const res = await apiFetch(`/inventory/goods-receipts/${id}/detail`);
  if (!res.ok)
    throw new Error("Gagal mengambil informasi detail goods receipt");
  return (await res.json()).data;
}

// buat goods receipt baru (tanpa PO)
export async function createGoodsReceipt(input: {
  supplier_id: string;
  location_id: string;
  receipt_date?: string;
  notes?: string | null;
  items: {
    item_id: string;
    quantity: number;
    notes?: string | null;
  }[];
}) {
  const res = await apiFetch("/inventory/goods-receipts", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to create goods receipt");
  return (await res.json()).data;
}

// update goods receipt
export async function updateGoodsReceipt(
  id: string,
  input: {
    supplier_id: string;
    location_id: string;
    receipt_date?: string;
    notes?: string | null;
    items: {
      item_id: string;
      quantity: number;
      notes?: string | null;
    }[];
  }
) {
  const res = await apiFetch(`/inventory/goods-receipts/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed updating goods receipt");
  return (await res.json()).data;
}

// hapus goods receipt
export async function deleteGoodsReceipt(id: string) {
  const res = await apiFetch(`/inventory/goods-receipts/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed deleting goods receipt");
  return (await res.json()).data;
}
