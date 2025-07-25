import type { MenuSection } from "../types/menu";

// src/services/menuService.ts
export async function fetchMenu(): Promise<MenuSection[]> {
  const res = await fetch("../dummyData/menu.json");
  if (!res.ok) throw new Error(`Failed to load menu.json: ${res.status}`);
  return res.json();
}
