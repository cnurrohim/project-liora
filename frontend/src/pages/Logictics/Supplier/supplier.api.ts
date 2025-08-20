// src/routes/supplier.api.ts
import { apiFetch } from "@/utils/apiFetch";

export async function getSuppliers() {
  const res = await apiFetch("/logistics/suppliers");
  if (!res.ok) throw new Error("Gagal mengambil data supplier");
  const data = await res.json();
  return data.data; // backend return { data: [...] }
}

export async function getSupplierById(id: string) {
  const res = await apiFetch(`/logistics/suppliers/${id}`);
  if (!res.ok) throw new Error("Gagal mengambil detail supplier");
  const data = await res.json();
  return data.data; // backend return { data: {...} }
}

export async function createSupplier(input: {
  name: string;
  contact?: string;
  address?: string;
}) {
  const res = await apiFetch("/logistics/suppliers", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Gagal membuat supplier");
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
  const res = await apiFetch(`/logistics/suppliers/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Gagal mengupdate supplier");
  return (await res.json()).data;
}

export async function deleteSupplier(id: string) {
  const res = await apiFetch(`/logistics/suppliers/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Gagal menghapus supplier");
  return (await res.json()).data;
}
