import { PERMISSIONS } from "@/constants/permissions";
import { useHasPermission } from "@/hooks/useHasPermission";

export function usePermissions() {
  const canView = useHasPermission([
    PERMISSIONS.SUPERADMIN.ALL_ACCESS,
    PERMISSIONS.DEV.ALL_ACCESS,
    PERMISSIONS.MENU.VIEW,
  ]);
  const canCreate = useHasPermission([
    PERMISSIONS.SUPERADMIN.ALL_ACCESS,
    PERMISSIONS.DEV.ALL_ACCESS,
    PERMISSIONS.MENU.CREATE,
  ]);
  const canUpdate = useHasPermission([
    PERMISSIONS.SUPERADMIN.ALL_ACCESS,
    PERMISSIONS.DEV.ALL_ACCESS,
    PERMISSIONS.MENU.UPDATE,
  ]);
  const canDelete = useHasPermission([
    PERMISSIONS.SUPERADMIN.ALL_ACCESS,
    PERMISSIONS.DEV.ALL_ACCESS,
    PERMISSIONS.MENU.DELETE,
  ]);

  return {
    canView,
    canCreate,
    canUpdate,
    canDelete,
    canSubmit: canCreate || canUpdate,
  };
}
