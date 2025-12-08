import { useFormContext, Controller } from "react-hook-form";
import MultiSelect from "@/components/SelectOptions/MultiSelect";
import { type Option } from "./UserFormTabs";
import { useRolePermissions } from "./useRolePermissions";
import { useMemo } from "react";
import { usePermissions } from "./permissions";
import ForbiddenPage from "pages/Misc/403";

type Props = {
  isEdit: boolean;
  userId?: string;
  roles: Option[];
};

export default function UserRolesForm({ isEdit, roles }: Props) {
  const { canView } = usePermissions();

  if (!canView) return <ForbiddenPage />;

  const {
    control,
    register,
    watch,
    formState: { errors },
  } = useFormContext();

  const selectedRoles = watch("roles") as Option[];
  const selectedRoleIds = useMemo(
    () => selectedRoles.map((r) => r.id),
    [selectedRoles]
  );

  const { permissions, loading } = useRolePermissions(selectedRoleIds);

  return (
    <div className="space-y-4 py-4">
      <h1 className="text-xl font-bold">{isEdit ? "Edit" : "Set"} Roles</h1>

      <div>
        <label className="block text-[var(--content-text-muted)]">Roles</label>
        <Controller
          control={control}
          name="roles"
          render={({ field, fieldState }) => (
            <div>
              <MultiSelect
                options={roles}
                value={field.value}
                onChange={field.onChange}
                placeholder="Pilih roles"
              />
              {fieldState.error && (
                <p className="text-[var(--danger)] text-sm mt-1">
                  {fieldState.error.message}
                </p>
              )}
            </div>
          )}
        />
      </div>

      {selectedRoles.length > 0 && (
        <div>
          <label className="block text-[var(--content-text-muted)]">
            Default Role
          </label>
          <select
            className="w-full p-2 bg-[var(--content-surface-hover)] rounded"
            {...register("defaultRole")}
          >
            <option value="">Pilih default role</option>
            {selectedRoles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
          {typeof errors.defaultRole?.message === "string" && (
            <p className="text-[var(--danger)] text-sm mt-1">
              {errors.defaultRole.message}
            </p>
          )}
        </div>
      )}

      {selectedRoles.length > 0 && (
        <div>
          <label className="block font-medium mt-4">
            Permissions dari Roles
          </label>
          {loading ? (
            <p className="text-sm text-[var(--content-text)]">
              Loading permissions...
            </p>
          ) : permissions.length === 0 ? (
            <p className="text-sm text-gray-500 italic">
              Tidak ada permission.
            </p>
          ) : (
            <ul className="mt-2 text-sm text-[var(--content-text)] list-disc list-inside space-y-1">
              {permissions.map((p) => (
                <li key={p.id}>
                  <strong>{p.label}</strong> — {p.description}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
