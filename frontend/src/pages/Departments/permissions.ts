import { PERMISSIONS } from "@/constants/permissions";
import { useHasPermission } from "@/hooks/useHasPermission";

export function useDepartmentPermissions() {
  const canView = useHasPermission([
    PERMISSIONS.SUPERADMIN.ALL_ACCESS,
    PERMISSIONS.DEV.ALL_ACCESS,
    PERMISSIONS.DEPARTMENT.VIEW,
  ]);
  const canCreate = useHasPermission([
    PERMISSIONS.SUPERADMIN.ALL_ACCESS,
    PERMISSIONS.DEV.ALL_ACCESS,
    PERMISSIONS.DEPARTMENT.CREATE,
  ]);
  const canUpdate = useHasPermission([
    PERMISSIONS.SUPERADMIN.ALL_ACCESS,
    PERMISSIONS.DEV.ALL_ACCESS,
    PERMISSIONS.DEPARTMENT.UPDATE,
  ]);
  const canDelete = useHasPermission([
    PERMISSIONS.SUPERADMIN.ALL_ACCESS,
    PERMISSIONS.DEV.ALL_ACCESS,
    PERMISSIONS.DEPARTMENT.DELETE,
  ]);

  return {
    canView,
    canCreate,
    canUpdate,
    canDelete,
    canSubmit: canCreate || canUpdate,
  };
}
