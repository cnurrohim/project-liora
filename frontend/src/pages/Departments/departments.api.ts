import { apiFetch } from "@/utils/apiFetch";

export async function getDepartments() {
  const res = await apiFetch("/departments");
  if (!res.ok) throw new Error("Gagal mengambil daftar menu");
  return (await res.json()).data;
}

export async function deleteDepartment(id: string) {
  const res = await apiFetch(`/departments/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Gagal menghapus menu");
  return await res.json();
}

export const getParentDepartments = async () => {
  const res = await apiFetch("/departments/parents");
  if (!res.ok) throw new Error("Gagal mengambil departemen");
  return (await res.json()).data;
};

export const getDepartmentById = async (id: string) => {
  const res = await apiFetch(`/departments/${id}`);
  if (!res.ok) throw new Error("Departemen tidak ditemukan");
  return (await res.json()).data;
};

export const createDepartment = async (data: any) => {
  const res = await apiFetch("/departments", {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Gagal membuat departemen");
  return res.json();
};

export const updateDepartment = async (id: string, data: any) => {
  const res = await apiFetch(`/departments/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Gagal memperbarui departemen");
  return res.json();
};
