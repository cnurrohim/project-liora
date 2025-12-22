import { apiFetch } from "@/utils/apiFetch";

function buildQueryParams(issue_number: string) {
  const params = new URLSearchParams();
  if (issue_number) params.append("issue_number", issue_number);
  if (params.size == 0) return "";
  return `?${params.toString()}`;
}

// ambil semua goods issues
export async function getGoodsIssues(issue_number: string) {
  const query = buildQueryParams(issue_number);
  const res = await apiFetch(`/inventory/goods-issues${query}`);

  if (!res.ok) throw new Error("Gagal mengambil data goods issue");
  const data = await res.json();
  return data.data;
}

// ambil goods issue by ID
export async function getGoodsIssueById(id: string) {
  const res = await apiFetch(`/inventory/goods-issues/${id}`);
  if (!res.ok) throw new Error("Gagal mengambil detail goods issue");
  const data = await res.json();
  return data.data;
}

// search goods issue
export async function searchGoodsIssues(term: string) {
  const res = await apiFetch(`/inventory/goods-issues/${term}/search`);
  if (!res.ok) throw new Error("Pencarian goods issue gagal");
  const data = await res.json();
  return data.data;
}

// ambil goods issue detail (header + items + movements)
export async function getGoodsIssueDetail(id: string) {
  const res = await apiFetch(`/inventory/goods-issues/${id}/detail`);
  if (!res.ok) throw new Error("Gagal mengambil informasi detail goods issue");
  return (await res.json()).data;
}

// buat goods issue baru
export async function createGoodsIssue(input: {
  issue_date?: string;
  notes?: string | null;
  items: {
    item_id: string;
    source_location_id: string;
    target_location_id?: string | null;
    quantity: number;
    notes?: string | null;
  }[];
}) {
  const res = await apiFetch("/inventory/goods-issues", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to create goods issue");
  return (await res.json()).data;
}

// update goods issue
export async function updateGoodsIssue(
  id: string,
  input: {
    issue_date?: string;
    notes?: string | null;
    items: {
      item_id: string;
      source_location_id: string;
      target_location_id?: string | null;
      quantity: number;
      notes?: string | null;
    }[];
  }
) {
  const res = await apiFetch(`/inventory/goods-issues/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed updating goods issue");
  return (await res.json()).data;
}

// hapus goods issue
export async function deleteGoodsIssue(id: string) {
  const res = await apiFetch(`/inventory/goods-issues/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed deleting goods issue");
  return (await res.json()).data;
}
