// src/api/pinnedMenu.api.ts
import { apiFetch } from "@/utils/apiFetch";

export async function getPinnedMenus() {
  const res = await apiFetch("/pinned-menus");
  if (!res.ok) throw new Error("Gagal mengambil daftar menu yang dipin");
  return await res.json();
}

export async function pinMenu(menuId: string) {
  const res = await apiFetch("/pinned-menus", {
    method: "POST",
    body: JSON.stringify({ menu_id: menuId }),
  });
  if (!res.ok) throw new Error("Gagal mem-pin menu");
  return (await res.json()).data;
}

export async function unpinMenu(menuId: string) {
  const res = await apiFetch(`/pinned-menus/${menuId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Gagal melepas pin menu");
  return (await res.json()).data;
}
