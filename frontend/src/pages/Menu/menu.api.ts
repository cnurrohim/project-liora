import { apiFetch } from "../../utils/apiFetch";

export async function getMenus() {
  const res = await apiFetch("/menu");
  if (!res.ok) throw new Error("Gagal mengambil daftar menu");
  return (await res.json()).data;
}

export async function getParentMenus() {
  const res = await apiFetch("/menu/parent-menu");
  if (!res.ok) throw new Error("Gagal mengambil daftar parent menu");
  return (await res.json()).data;
}

export async function getMenuById(id: string) {
  const res = await apiFetch(`/menu/${id}`);
  if (!res.ok) throw new Error("Gagal mengambil detail menu");
  return (await res.json()).data;
}

export async function createMenu(data: any) {
  const res = await apiFetch("/menu", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Gagal membuat menu");
  return await res.json();
}

export async function updateMenu(id: string, data: any) {
  const res = await apiFetch(`/menu/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Gagal memperbarui menu");
  return await res.json();
}

export async function deleteMenu(id: string) {
  const res = await apiFetch(`/menu/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Gagal menghapus menu");
  return await res.json();
}

export async function handleReorder(id: string, isLiftUp: boolean) {
  try {
    const res = await apiFetch(`/menu/reorder`, {
      method: "POST",
      body: JSON.stringify({ id, isLiftUp }),
    });

    if (!res.ok) throw new Error("Gagal reorder");
  } catch (err) {
    console.error("Gagal reorder", err);
  }
}
