import { PERMISSIONS } from "@/constants/permissions";
import { useHasPermission } from "@/hooks/useHasPermission";

export function usePermissions() {
  const canView = useHasPermission([
    PERMISSIONS.DEV.ALL_ACCESS,
    PERMISSIONS.USER_PROFILE.VIEW,
  ]);
  const canCreate = useHasPermission([
    PERMISSIONS.DEV.ALL_ACCESS,
    PERMISSIONS.USER_PROFILE.CREATE,
  ]);
  const canUpdate = useHasPermission([
    PERMISSIONS.DEV.ALL_ACCESS,
    PERMISSIONS.USER_PROFILE.UPDATE,
  ]);
  const canDelete = useHasPermission([
    PERMISSIONS.DEV.ALL_ACCESS,
    PERMISSIONS.USER_PROFILE.DELETE,
  ]);

  return {
    canView,
    canCreate,
    canUpdate,
    canDelete,
    canSubmit: canCreate || canUpdate,
  };
}
