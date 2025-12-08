import { apiFetch } from "@/utils/apiFetch";

export async function getDepartments() {
  const res = await apiFetch("/departments");
  if (!res.ok) throw new Error("Failed to fetch department list");
  return (await res.json()).data;
}

export async function deleteDepartment(id: string) {
  const res = await apiFetch(`/departments/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete department");
  return await res.json();
}

export const getParentDepartments = async () => {
  const res = await apiFetch("/departments/parents");
  if (!res.ok) throw new Error("Failed to fetch departemen");
  return (await res.json()).data;
};

export const getDepartmentById = async (id: string) => {
  const res = await apiFetch(`/departments/${id}`);
  if (!res.ok) throw new Error("Departemen not found");
  return (await res.json()).data;
};

export const createDepartment = async (data: any) => {
  const res = await apiFetch("/departments", {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to create departemen");
  return res.json();
};

export const updateDepartment = async (id: string, data: any) => {
  const res = await apiFetch(`/departments/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to update department");
  return res.json();
};
