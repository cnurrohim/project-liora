import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouteParamsFromTab } from "../../hooks/useRouteParams";
import {
  createUser,
  getDepartments,
  getRoles,
  getUserById,
  updateUser,
} from "./user.api";
import { showErrorToast, showSuccessToast } from "../../utils/toast";
import MultiSelect from "../../components/SelectOptions/MultiSelect";

type Option = { id: string; name: string };

const schema = z
  .object({
    name: z.string().min(1, "Nama wajib diisi"),
    username: z.string().min(1, "Username wajib diisi"),
    email: z.string().email("Email tidak valid"),
    password: z.string().min(6, "Minimal 6 karakter").optional(),
    is_active: z.boolean(),
    roles: z
      .array(
        z.object({
          id: z.string(),
          name: z.string(),
        })
      )
      .min(1, { message: "Pilih minimal satu role" }),
    defaultRole: z.string().min(1, "Pilih role default"),
    departments: z
      .array(
        z.object({
          id: z.string(),
          name: z.string(),
        })
      )
      .min(1, { message: "Pilih minimal satu departemen" }),
  })
  .refine((data) => data.roles.some((r) => r.id === data.defaultRole), {
    message: "Default role harus salah satu dari daftar role",
    path: ["defaultRole"],
  });

type FormValues = z.infer<typeof schema>;

export default function UserFormPage() {
  const { id } = useRouteParamsFromTab("/user/:id/edit");
  const isEdit = !!id;

  const [roles, setRoles] = useState<Option[]>([]);
  const [departments, setDepartments] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      is_active: true,
      roles: [],
      departments: [],
    },
  });

  useEffect(() => {
    const load = async () => {
      const roleRes = await getRoles();
      const deptRes = await getDepartments();

      const roleOptions = roleRes.map((r: any) => ({
        id: r.id,
        name: r.name,
      }));

      const departmentOptions = deptRes.map((d: any) => ({
        id: d.id,
        name: d.name,
      }));

      setRoles(roleOptions);
      setDepartments(departmentOptions);
    };
    load();
  }, []);

  useEffect(() => {
    if (isEdit) {
      getUserById(id!).then((user) => {
        reset({
          name: user.name,
          username: user.username,
          email: user.email,
          is_active: user.is_active,
          roles: user.roles,
          defaultRole: user.default_role_id,
          departments: user.departments,
        });
      });
    }
  }, [isEdit, id, reset]);

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true);

      const payload = {
        name: data.name,
        username: data.username,
        email: data.email,
        password: data.password || "changeme123",
        is_active: data.is_active,
        roleIds: data.roles.map((r) => r.id),
        defaultRoleId: data.defaultRole,
        departmentIds: data.departments.map((d) => d.id),
      };

      if (isEdit) {
        await updateUser(id!, payload);
        showSuccessToast("User berhasil diperbarui");
      } else {
        await createUser(payload);
        showSuccessToast("User berhasil dibuat");
      }
    } catch (err: any) {
      showErrorToast(err.message || "Gagal menyimpan data user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4 max-w-xl p-4" onSubmit={handleSubmit(onSubmit)}>
      <h1 className="text-xl font-bold">{isEdit ? "Edit" : "Tambah"} User</h1>

      <div>
        <label className="block">Name</label>
        <input
          className="w-full p-2 bg-gray-800 rounded"
          {...register("name")}
        />
        {errors.name && (
          <p className="text-red-500 text-sm">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block">Username</label>
        <input
          className="w-full p-2 bg-gray-800 rounded"
          {...register("username")}
        />
        {errors.username && (
          <p className="text-red-500 text-sm">{errors.username.message}</p>
        )}
      </div>

      <div>
        <label className="block">Email</label>
        <input
          className="w-full p-2 bg-gray-800 rounded"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-red-500 text-sm">{errors.email.message}</p>
        )}
      </div>

      {!isEdit && (
        <div>
          <label className="block">Password</label>
          <input
            type="password"
            className="w-full p-2 bg-gray-800 rounded"
            {...register("password", { required: true })}
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}
        </div>
      )}

      <div>
        <label className="block">Roles</label>
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
                <p className="text-red-500 text-sm mt-1">
                  {fieldState.error.message}
                </p>
              )}
            </div>
          )}
        />
      </div>

      {watch("roles").length > 0 && (
        <div>
          <label className="block">Default Role</label>
          <select
            className="w-full p-2 bg-gray-800 rounded"
            {...register("defaultRole")}
          >
            <option value="">Pilih default role</option>
            {watch("roles").map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
          {errors.defaultRole && (
            <p className="text-red-500 text-sm mt-1">
              {errors.defaultRole.message}
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
                placeholder="Pilih departements"
              />
              {fieldState.error && (
                <p className="text-red-500 text-sm mt-1">
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

      <div className="pt-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 px-4 py-2 rounded text-white disabled:opacity-50"
        >
          {loading ? "Menyimpan..." : "Simpan"}
        </button>
      </div>
    </form>
  );
}
