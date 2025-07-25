import { apiFetch } from "../../utils/apiFetch";
import { showErrorToast, toastConfirmSuccess } from "../../utils/toast";

export async function getUsers() {
  const res = await apiFetch("/users");
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json(); // { users: [...] }
}

export async function getUserById(id: string) {
  const res = await apiFetch(`/users/${id}`);
  if (!res.ok) throw new Error("Failed to fetch user");
  return res.json(); // { user: {...} }
}

export async function createUser(data: {
  name: string;
  username: string;
  email: string;
  password: string;
  roleIds: string[]; // bisa dipilih lebih dari 1
  isActive?: boolean;
}) {
  const res = await apiFetch("/users", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err?.error || "Failed to create user");
  }

  return res.json();
}

export async function updateUser(
  id: string,
  data: Partial<{
    name: string;
    username: string;
    email: string;
    password: string;
    roleIds: string[];
    isActive: boolean;
  }>
) {
  const res = await apiFetch(`/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err?.error || "Failed to update user");
  }

  return res.json();
}

export async function deleteUser(id: string) {
  const res = await apiFetch(`/users/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const err = await res.json();
    showErrorToast("User gagal dihapus!");
    throw new Error(err?.error || "Failed to delete user");
  }

  toastConfirmSuccess("User berhasil dihapus!");
  return res.json();
}
