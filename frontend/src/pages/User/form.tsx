import { useFormContext, Controller } from "react-hook-form";
import MultiSelect from "@/components/SelectOptions/MultiSelect";
import { type Option } from "./UserFormTabs";
import { usePermissions } from "./permissions";
import ForbiddenPage from "../Misc/403";

type Props = {
  isEdit: boolean;
  userId?: string;
  departments: Option[];
};

export default function UserFormPage({ isEdit, departments }: Props) {
  const { canView } = usePermissions();

  if (!canView) return <ForbiddenPage />;

  const {
    control,
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="space-y-4 py-4">
      <h1 className="text-xl font-bold">{isEdit ? "Edit" : "Add"} User</h1>

      <div>
        <label className="block">Full Name</label>
        <input
          className="w-full p-2 bg-[var(--background)] rounded"
          {...register("name")}
        />
        {typeof errors.name?.message === "string" && (
          <p className="text-[var(--danger)] text-sm">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block">Username</label>
        <input
          className="w-full p-2 bg-[var(--background)] rounded"
          {...register("username")}
        />
        {typeof errors.username?.message === "string" && (
          <p className="text-[var(--danger)] text-sm">
            {errors.username.message}
          </p>
        )}
      </div>

      <div>
        <label className="block">Email</label>
        <input
          className="w-full p-2 bg-[var(--background)] rounded"
          {...register("email")}
        />
        {typeof errors.email?.message === "string" && (
          <p className="text-[var(--danger)] text-sm">{errors.email.message}</p>
        )}
      </div>

      {!isEdit && (
        <div>
          <label className="block">Password</label>
          <input
            type="password"
            className="w-full p-2 bg-[var(--background)] rounded"
            {...register("password", { required: true })}
          />
          {typeof errors.password?.message === "string" && (
            <p className="text-[var(--danger)] text-sm">
              {errors.password.message}
            </p>
          )}
        </div>
      )}

      <div>
        <label className="block">Departments</label>
        <Controller
          control={control}
          name="departments"
          render={({ field, fieldState }) => (
            <div>
              <MultiSelect
                options={departments}
                value={field.value}
                onChange={field.onChange}
                placeholder="Pilih departement"
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

      <div>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" {...register("is_active")} />
          <span>Aktif</span>
        </label>
      </div>
    </div>
  );
}
