// src/routes/purchaseOrder.api.ts
import { apiFetch } from "@/utils/apiFetch";

export async function getPurchaseOrders() {
  const res = await apiFetch("/logistics/purchase-orders");
  if (!res.ok) throw new Error("Gagal mengambil data purchase order");
  const data = await res.json();
  return data.data;
}

export async function getPurchaseOrderById(id: string) {
  const res = await apiFetch(`/logistics/purchase-orders/${id}`);
  if (!res.ok) throw new Error("Gagal mengambil detail purchase order");
  const data = await res.json();
  return data.data;
}

export async function searchPurchaseOrders(term: string) {
  const res = await apiFetch(`/logistics/purchase-orders/${term}/search`);
  if (!res.ok) throw new Error("pencarian purchase order gagal");
  const data = await res.json();
  return data.data;
}

export async function getPurchaseOrderDetail(id: string) {
  const res = await apiFetch(`/logistics/purchase-orders/${id}/detail`);

  if (!res.ok) {
    throw new Error("Gagal mengambil informasi detail purchase orders");
  }

  return (await res.json()).data;
}

export async function createPurchaseOrder(input: {
  //   order_number: string;
  supplier_id: string;
  order_date?: string;
  status: "draft" | "confirmed" | "received" | "cancelled";
  items?: {
    item_id: string;
    qty: number;
    price: number;
  }[];
}) {
  const res = await apiFetch("/logistics/purchase-orders", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Gagal membuat purchase order");
  return (await res.json()).data;
}

export async function createPurchaseReceive(
  purchaseOrderId: string,
  input: {
    receive_date?: string;
    location_id?: string;
    note?: string;
    items: {
      item_id: string;
      qty: number;
    }[];
  }
) {
  const res = await apiFetch(
    `/logistics/purchase-orders/${purchaseOrderId}/receive`,
    {
      method: "POST",
      body: JSON.stringify(input),
    }
  );
  if (!res.ok) throw new Error("Gagal membuat purchase receive");
  return (await res.json()).data;
}

export async function updatePurchaseOrder(
  id: string,
  input: {
    // order_number: string;
    supplier_id: string;
    order_date?: string;
    status: "draft" | "confirmed" | "received" | "cancelled";
    items?: {
      item_id: string;
      qty: number;
      price: number;
    }[];
  }
) {
  // Catatan: di route backend kamu belum ada PUT untuk update PO.
  // Kalau mau update, perlu tambahin endpoint PUT di purchaseOrder.route.ts
  const res = await apiFetch(`/logistics/purchase-orders/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Gagal mengupdate purchase order");
  return (await res.json()).data;
}

export async function deletePurchaseOrder(id: string) {
  const res = await apiFetch(`/logistics/purchase-orders/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Gagal menghapus purchase order");
  return (await res.json()).data;
}

export async function approvePurchaseOrder(id: string) {
  const res = await apiFetch(`/logistics/purchase-orders/${id}/approve`, {
    method: "PUT",
  });
  if (!res.ok) throw new Error("Gagal menyetujui purchase order");
  return (await res.json()).data;
}

export async function cancelPurchaseOrder(id: string) {
  const res = await apiFetch(`/logistics/purchase-orders/${id}/cancel`, {
    method: "PUT",
  });
  if (!res.ok) throw new Error("Gagal membatalkan purchase order");
  return (await res.json()).data;
}
