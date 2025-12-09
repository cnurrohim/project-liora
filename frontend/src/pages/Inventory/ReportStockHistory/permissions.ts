import { PERMISSIONS } from "@/constants/permissions";
import { useHasPermission } from "@/hooks/useHasPermission";

export function usePermissions() {
  const canView = useHasPermission([
    PERMISSIONS.SUPERADMIN.ALL_ACCESS,
    PERMISSIONS.DEV.ALL_ACCESS,
    PERMISSIONS.REPORT_INVENTORY_HISTORY.VIEW,
  ]);

  return {
    canView,
  };
}
