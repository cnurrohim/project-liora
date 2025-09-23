import { apiFetch } from "@/utils/apiFetch";

// === CARD ===
export async function getTotalItems() {
  const res = await apiFetch("/widgets/total-items");
  return (await res.json()).total;
}

export async function getLowStock() {
  const res = await apiFetch("/widgets/low-stock");
  return (await res.json()).low_stock;
}

export async function getOpenPO() {
  const res = await apiFetch("/widgets/open-po");
  return (await res.json()).open_po;
}

// === TABLE ===
export async function getRecentGR() {
  const res = await apiFetch("/widgets/recent-gr");
  return (await res.json()).rows;
}

export async function getRecentGI() {
  const res = await apiFetch("/widgets/recent-gi");
  return (await res.json()).rows;
}

// === CHART ===
export async function getMonthlyFlow() {
  const res = await apiFetch("/widgets/monthly-flow");
  return (await res.json()).rows;
}

export async function getStockByLocation() {
  const res = await apiFetch("/widgets/stock-by-location");
  return (await res.json()).rows;
}

export async function getFastMoving() {
  const res = await apiFetch("/widgets/fast-moving");
  return (await res.json()).rows;
}
