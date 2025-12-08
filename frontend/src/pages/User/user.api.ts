import { apiFetch } from "@/utils/apiFetch";

export async function getUsers() {
  const res = await apiFetch("/users");
  if (!res.ok) throw new Error("Failed mengambil data user");
  const data = await res.json();
  return data.users;
}

export async function getUserById(id: string) {
  const res = await apiFetch(`/users/${id}`);
  if (!res.ok) throw new Error("Failed mengambil detail user");
  const data = await res.json();
  return data.user;
}

export async function getUserDetail(id: string) {
  const res = await apiFetch(`/users/detail/${id}`);

  if (!res.ok) {
    throw new Error("Failed fetching user details");
  }

  return await res.json();
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
  if (!res.ok) throw new Error("Failed to create user");
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
  if (!res.ok) throw new Error("Failed updating user");
  return res.json();
}

export async function deleteUser(id: string) {
  const res = await apiFetch(`/users/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed deleting user");
  return res.json();
}

export async function toggleActivationUser(id: string) {
  const res = await apiFetch(`/users/${id}/toggleActivation`, {
    method: "PUT",
  });
  if (!res.ok) throw new Error("Failed user inactivation");
  return res.json();
}

export async function getRoles() {
  const res = await apiFetch("/roles");
  if (!res.ok) throw new Error("Failed fetching roles");
  return (await res.json()).roles;
}

export async function getDepartments() {
  const res = await apiFetch("/departments");
  if (!res.ok) throw new Error("Failed fetching departments");
  return (await res.json()).data;
}

export async function getUserPermissions(userId: string) {
  const res = await apiFetch(`/permissions/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch data override");
  return (await res.json()).permissions;
}
