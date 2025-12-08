import { apiFetch } from "@/utils/apiFetch";
import { toastConfirmSuccess } from "@/utils/toast";

export async function getRoles() {
  const res = await apiFetch("/roles");
  if (!res.ok) throw new Error("Gagal mengambil daftar role");
  const data = await res.json();
  return data.roles;
}

export async function createRole(data: {
  name: string;
  description: string;
  permissions: string[];
}) {
  const res = await apiFetch("/roles", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to create role");
  }
}

export async function updateRole(
  id: string,
  data: {
    name: string;
    description: string;
    permissions: string[];
  }
) {
  const res = await apiFetch(`/roles/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failde to update role");
  }
}

export async function deleteRole(id: string) {
  await apiFetch(`/roles/${id}`, {
    method: "DELETE",
  });

  toastConfirmSuccess("role deleted!");
}

export async function getRoleById(id: string) {
  const res = await apiFetch(`/roles/${id}`);
  if (!res.ok) {
    throw new Error("Failed to fetch role");
  }
  const data = await res.json();
  return data;
}

export async function getAllPermissions() {
  const res = await apiFetch("/permissions");
  if (!res.ok) {
    throw new Error("Failed to fetch permissions");
  }

  const data = await res.json();
  return data.permissions;
}

export async function getPermissionsByRoleIds(roleIds: string[]) {
  const query = roleIds.join(",");
  const res = await apiFetch(`/permissions/by-roles?roleIds=${query}`);
  if (!res.ok) {
    throw new Error("Failed to fetch permissions");
  }

  return (await res.json()).permissions;
}

export async function getRoleDetail(id: string) {
  const res = await apiFetch(`/roles/detail/${id}`);

  if (!res.ok) {
    throw new Error("Failed to fetch role details ");
  }

  const data = await res.json();

  const { role, permissions } = data;

  return {
    id: role.id,
    name: role.name,
    description: role.description,
    permissions,
  };
}
