import { useMemo } from "react";
import { getUserPermissions } from "../utils/auth";

export function useHasPermission(required: string | string[]) {
  return useMemo(() => {
    const permissions = getUserPermissions();
    console.log(permissions);
    const requiredPerms = Array.isArray(required) ? required : [required];
    return requiredPerms.some((perm) => permissions.includes(perm));
  }, [required]);
}
