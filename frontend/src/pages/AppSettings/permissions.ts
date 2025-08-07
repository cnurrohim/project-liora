import { PERMISSIONS } from "@/constants/permissions";
import { useHasPermission } from "@/hooks/useHasPermission";

export function useDepartmentPermissions() {
  const canView = useHasPermission([
    PERMISSIONS.DEV.ALL_ACCESS,
    PERMISSIONS.APP_SETTING.VIEW,
  ]);
  const canCreate = useHasPermission([
    PERMISSIONS.DEV.ALL_ACCESS,
    PERMISSIONS.APP_SETTING.CREATE,
  ]);
  const canUpdate = useHasPermission([
    PERMISSIONS.DEV.ALL_ACCESS,
    PERMISSIONS.APP_SETTING.UPDATE,
  ]);
  const canDelete = useHasPermission([
    PERMISSIONS.DEV.ALL_ACCESS,
    PERMISSIONS.APP_SETTING.DELETE,
  ]);

  return {
    canView,
    canCreate,
    canUpdate,
    canDelete,
    canSubmit: canCreate || canUpdate,
  };
}
