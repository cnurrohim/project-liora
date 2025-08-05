import { useEffect, useState } from "react";
import { getPermissionsByRoleIds } from "../role/role.api";
import type { Permission } from "./UserPermissionOverrideForm";

export function useRolePermissions(roleIds: string[]) {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      if (!roleIds.length) {
        setPermissions([]);
        return;
      }
      setLoading(true);
      const result = await getPermissionsByRoleIds(roleIds);
      setPermissions(result);
      setLoading(false);
    };
    fetch();
  }, [roleIds]);

  return { permissions, loading };
}
