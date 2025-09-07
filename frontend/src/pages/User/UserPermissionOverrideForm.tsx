import { useEffect, useMemo, useState } from "react";
import { groupBy } from "lodash";
import {
  getAllPermissions,
  getPermissionsByRoleIds,
} from "pages/role/role.api";
import { getUserPermissions } from "./user.api";
import { usePermissions } from "./permissions";
import ForbiddenPage from "pages/Misc/403";

type Props = {
  userId?: string;
  selectedRoleIds: string[];
  overrides: Record<string, boolean>;
  setOverrides: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
};

export type Permission = {
  id: string;
  name: string;
  label: string;
  domain: string | null;
  description?: string | null;
};

export default function UserPermissionOverrideForm({
  userId,
  selectedRoleIds,
  overrides,
  setOverrides,
}: Props) {
  const { canView } = usePermissions();

  if (!canView) return <ForbiddenPage />;

  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [defaultPermissions, setDefaultPermissions] = useState<
    Record<string, boolean>
  >({});

  // Memoize selectedRoleIds to avoid infinite loop
  const stableSelectedRoleIds = useMemo(
    () => [...selectedRoleIds].sort().join(","), // stringified version for effect dependency
    [selectedRoleIds]
  );

  useEffect(() => {
    const fetchPermissions = async () => {
      const all = await getAllPermissions();
      setAllPermissions(all);

      const grantedMap: Record<string, boolean> = {};
      if (selectedRoleIds.length) {
        const fromRoles = await getPermissionsByRoleIds(selectedRoleIds);
        fromRoles.forEach((p: Permission) => {
          grantedMap[p.id] = true;
        });
      }

      setDefaultPermissions(grantedMap);

      // Fetch user-specific overrides only if editing
      if (userId) {
        const userPerms = await getUserPermissions(userId);
        const overridesMap: Record<string, boolean> = {};
        (userPerms || []).forEach(({ permission_id, granted }: any) => {
          // Override only if different from default
          if (granted !== grantedMap[permission_id]) {
            overridesMap[permission_id] = granted;
          }
        });
        setOverrides(overridesMap);
      } else {
        setOverrides({});
      }
    };

    fetchPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stableSelectedRoleIds, userId]);

  const toggle = (permId: string) => {
    setOverrides((prev) => {
      const isOverridden = prev.hasOwnProperty(permId);
      if (isOverridden) {
        const { [permId]: _, ...rest } = prev;
        return rest;
      }
      const defaultGranted = defaultPermissions[permId] ?? false;
      return { ...prev, [permId]: !defaultGranted };
    });
  };

  const grouped = useMemo(
    () => groupBy(allPermissions, (p) => p.domain || "General"),
    [allPermissions]
  );

  return (
    <div className="grid gap-10 grid-cols-[repeat(auto-fit,minmax(300px,1fr))] py-4">
      {Object.entries(grouped).map(([domain, perms]) => (
        <div key={domain} className="w-fit">
          <h3 className="font-bold text-sm mb-2">{domain}</h3>
          <div className="flex flex-col gap-2">
            {perms.map((perm) => {
              const override = overrides[perm.id];
              const granted =
                override !== undefined
                  ? override
                  : defaultPermissions[perm.id] ?? false;
              return (
                <label
                  key={perm.id}
                  className="flex items-center gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={granted}
                    onChange={() => toggle(perm.id)}
                  />
                  {perm.label || perm.name}
                  {override !== undefined && (
                    <span className="text-xs text-[var(--content-text)]">
                      ({override ? "granted" : "revoked"})
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
