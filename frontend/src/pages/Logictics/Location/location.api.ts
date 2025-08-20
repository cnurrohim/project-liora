// src/routes/location.api.ts
import { apiFetch } from "@/utils/apiFetch";

export async function getLocations() {
  const res = await apiFetch("/logistics/locations");
  if (!res.ok) throw new Error("Gagal mengambil data lokasi");
  const data = await res.json();
  return data.data; // backend return { data: [...] }
}

export async function getLocationById(id: string) {
  const res = await apiFetch(`/logistics/locations/${id}`);
  if (!res.ok) throw new Error("Gagal mengambil detail lokasi");
  const data = await res.json();
  return data.data; // backend return { data: {...} }
}

export async function createLocation(input: {
  code: string;
  description?: string;
}) {
  const res = await apiFetch("/logistics/locations", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Gagal membuat lokasi");
  return (await res.json()).data;
}

export async function updateLocation(
  id: string,
  input: {
    code: string;
    description?: string;
  }
) {
  const res = await apiFetch(`/logistics/locations/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Gagal mengupdate lokasi");
  return (await res.json()).data;
}

export async function deleteLocation(id: string) {
  const res = await apiFetch(`/logistics/locations/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Gagal menghapus lokasi");
  return (await res.json()).data;
}
