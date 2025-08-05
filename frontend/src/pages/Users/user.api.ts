import { apiFetch } from "../../utils/apiFetch";

export async function getUsers() {
  const res = await apiFetch("/users");
  if (!res.ok) throw new Error("Gagal mengambil data user");
  const data = await res.json();
  return data.users;
}

export async function getUserById(id: string) {
  const res = await apiFetch(`/users/${id}`);
  if (!res.ok) throw new Error("Gagal mengambil detail user");
  const data = await res.json();
  return data.user;
}

export async function createUser(input: {
  name: string;
  username?: string;
  email: string;
  password: string;
  is_active?: boolean;
  roleIds?: string[];
  departmentIds?: string[];
}) {
  const res = await apiFetch("/users", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Gagal membuat user");
  return res.json();
}

export async function updateUser(
  id: string,
  input: {
    name: string;
    username?: string;
    email: string;
    password?: string;
    is_active?: boolean;
    roleIds?: string[];
    departmentIds?: string[];
    defaultRole?: string;
  }
) {
  const res = await apiFetch(`/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Gagal mengupdate user");
  return res.json();
}

export async function deleteUser(id: string) {
  const res = await apiFetch(`/users/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Gagal menghapus user");
  return res.json();
}

export async function getRoles() {
  const res = await apiFetch("/roles");
  if (!res.ok) throw new Error("Gagal mengambil roles");
  return (await res.json()).roles;
}

export async function getDepartments() {
  const res = await apiFetch("/departments");
  if (!res.ok) throw new Error("Gagal mengambil departments");
  return (await res.json()).data;
}

export async function getUserPermissions(userId: string) {
  const res = await apiFetch(`/permissions/${userId}`);
  if (!res.ok) throw new Error("Gagal ambil data override");
  return (await res.json()).permissions;
}
