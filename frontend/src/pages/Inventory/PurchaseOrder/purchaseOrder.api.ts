import { apiFetch } from "@/utils/apiFetch";

function buildQueryParams(order_number: string) {
  const params = new URLSearchParams();
  if (order_number) params.append("order_number", order_number);
  if (params.size == 0) return "";
  return `?${params.toString()}`;
}

export async function getPurchaseOrders(order_number: string) {
  const query = buildQueryParams(order_number);
  const res = await apiFetch(`/inventory/purchase-orders${query}`);
  if (!res.ok) throw new Error("Gagal mengambil data purchase order");
  const data = await res.json();
  return data.data;
}

export async function getPurchaseOrderById(id: string) {
  const res = await apiFetch(`/inventory/purchase-orders/${id}`);
  if (!res.ok) throw new Error("Gagal mengambil detail purchase order");
  const data = await res.json();
  return data.data;
}

export async function searchPurchaseOrders(term: string) {
  const res = await apiFetch(`/inventory/purchase-orders/${term}/search`);
  if (!res.ok) throw new Error("pencarian purchase order gagal");
  const data = await res.json();
  return data.data;
}

export async function getPurchaseOrderDetail(id: string) {
  const res = await apiFetch(`/inventory/purchase-orders/${id}/detail`);

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
  }[];
}) {
  const res = await apiFetch("/inventory/purchase-orders", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to create purchase order");
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
    `/inventory/purchase-orders/${purchaseOrderId}/receive`,
    {
      method: "POST",
      body: JSON.stringify(input),
    }
  );
  if (!res.ok) throw new Error("Failed to create purchase receive");
  return (await res.json()).data;
}

export async function updatePurchaseOrder(
  id: string,
  input: {
    supplier_id: string;
    order_date?: string;
    status: "draft" | "confirmed" | "received" | "cancelled";
    items?: {
      item_id: string;
      qty: number;
    }[];
  }
) {
  const res = await apiFetch(`/inventory/purchase-orders/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed updating purchase order");
  return (await res.json()).data;
}

export async function deletePurchaseOrder(id: string) {
  const res = await apiFetch(`/inventory/purchase-orders/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed deleting purchase order");
  return (await res.json()).data;
}

export async function approvePurchaseOrder(id: string) {
  const res = await apiFetch(`/inventory/purchase-orders/${id}/approve`, {
    method: "PUT",
  });
  if (!res.ok) throw new Error("Failed approving purchase order");
  return (await res.json()).data;
}

export async function cancelPurchaseOrder(id: string) {
  const res = await apiFetch(`/inventory/purchase-orders/${id}/cancel`, {
    method: "PUT",
  });
  if (!res.ok) throw new Error("Failed canceling purchase order");
  return (await res.json()).data;
}
