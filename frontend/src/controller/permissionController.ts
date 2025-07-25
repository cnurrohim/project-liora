import { apiFetch } from "../utils/apiFetch";

export type Permission = {
  id: string;
  name: string;
  label: string;
  description?: string;
  domain: string; // sebelumnya kamu sebut “group”
};

export type PermissionGroup = {
  domain: string;
  permissions: Permission[];
};

let permissions: Set<string> = new Set();

export const PermissionController = {
  async getPermissions() {
    try {
      const res = await apiFetch("/auth/me");

      if (!res.ok) {
        const text = await res.text(); // untuk debugging
        console.error("Gagal getPermissions:", text);
        return;
      }

      const data = await res.json();
      const user = data.user;

      if (user?.permissions) {
        PermissionController.setPermissions(user.permissions);
      }

      return () => {
        PermissionController.clear();
      };
    } catch (err) {
      console.error("initializeApp error", err);
      throw err;
    }
  },

  groupPermissionsByDomain(permissions: Permission[]): PermissionGroup[] {
    const groups: Record<string, Permission[]> = {};

    for (const perm of permissions) {
      const domain = perm.domain || "Umum";
      if (!groups[domain]) groups[domain] = [];
      groups[domain].push(perm);
    }

    return Object.entries(groups).map(([domain, permissions]) => ({
      domain,
      permissions,
    }));
  },

  setPermissions(perms: string[]) {
    permissions = new Set(perms);
  },

  hasPermission(perm: string): boolean {
    return permissions.has(perm);
  },

  getAll(): string[] {
    return Array.from(permissions);
  },

  clear() {
    permissions.clear();
  },
};
