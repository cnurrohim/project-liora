import { PERMISSIONS } from "@/constants/permissions";
import { useHasPermission } from "@/hooks/useHasPermission";

export function usePermissions() {
  const canView = useHasPermission([
    PERMISSIONS.SUPERADMIN.ALL_ACCESS,
    PERMISSIONS.DEV.ALL_ACCESS,
    PERMISSIONS.GOODS_ISSUE.VIEW,
  ]);
  const canCreate = useHasPermission([
    PERMISSIONS.SUPERADMIN.ALL_ACCESS,
    PERMISSIONS.DEV.ALL_ACCESS,
    PERMISSIONS.GOODS_ISSUE.CREATE,
  ]);
  const canUpdate = useHasPermission([
    PERMISSIONS.SUPERADMIN.ALL_ACCESS,
    PERMISSIONS.DEV.ALL_ACCESS,
    PERMISSIONS.GOODS_ISSUE.UPDATE,
  ]);
  const canDelete = useHasPermission([
    PERMISSIONS.SUPERADMIN.ALL_ACCESS,
    PERMISSIONS.DEV.ALL_ACCESS,
    PERMISSIONS.GOODS_ISSUE.DELETE,
  ]);

  const canApprove = useHasPermission([
    PERMISSIONS.SUPERADMIN.ALL_ACCESS,
    PERMISSIONS.DEV.ALL_ACCESS,
    PERMISSIONS.GOODS_ISSUE.APPROVE,
  ]);

  const canReceive = useHasPermission([
    PERMISSIONS.SUPERADMIN.ALL_ACCESS,
    PERMISSIONS.DEV.ALL_ACCESS,
    PERMISSIONS.GOODS_ISSUE.RECEIVE,
  ]);

  const canCancel = useHasPermission([
    PERMISSIONS.SUPERADMIN.ALL_ACCESS,
    PERMISSIONS.DEV.ALL_ACCESS,
    PERMISSIONS.GOODS_ISSUE.CANCEL,
  ]);

  return {
    canView,
    canCreate,
    canUpdate,
    canDelete,
    canApprove,
    canReceive,
    canCancel,
    canSubmit: canCreate || canUpdate,
  };
}
