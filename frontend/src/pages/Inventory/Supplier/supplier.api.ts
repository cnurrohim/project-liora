import { apiFetch } from "@/utils/apiFetch";

export async function getSuppliers() {
  const res = await apiFetch("/inventory/suppliers");
  if (!res.ok) throw new Error("Failed fetching suppliers");
  const data = await res.json();
  return data.data; // backend return { data: [...] }
}

export async function getSupplierById(id: string) {
  const res = await apiFetch(`/inventory/suppliers/${id}`);
  if (!res.ok) throw new Error("Failed fetching supplier list");
  const data = await res.json();
  return data.data; // backend return { data: {...} }
}

export async function createSupplier(input: {
  name: string;
  contact?: string;
  address?: string;
}) {
  const res = await apiFetch("/inventory/suppliers", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to create supplier");
  return (await res.json()).data;
}

export async function updateSupplier(
  id: string,
  input: {
    name: string;
    contact?: string;
    address?: string;
  }
) {
  const res = await apiFetch(`/inventory/suppliers/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed updating supplier");
  return (await res.json()).data;
}

export async function deleteSupplier(id: string) {
  const res = await apiFetch(`/inventory/suppliers/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed deleting supplier");
  return (await res.json()).data;
}
