// src/pages/roles/RoleFormPage.tsx
import { useEffect, useState } from "react";

import { showErrorToast, showSuccessToast } from "../../utils/toast";
import {
  createRole,
  getAllPermissions,
  getRoleById,
  updateRole,
} from "./role.api";
import { RouteRegistry } from "../../config/routeRegistry";
import { TabController } from "../../components/Tab/controller";
import PermissionForm from "./permissionForm";
import { useRouteParamsFromTab } from "../../hooks/useRouteParams";

export default function RoleFormPage() {
  const { id } = useRouteParamsFromTab("/roles/:id/edit");

  const isEdit = !!id;

  const [form, setForm] = useState({
    name: "",
    description: "",
    label: "",
    permissions: [] as string[],
  });
  const [allPermissions, setAllPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const init = async () => {
      try {
        const perms = await getAllPermissions();
        setAllPermissions(perms);

        if (isEdit && id) {
          (async () => {
            try {
              const role = await getRoleById(id);
              setForm({
                name: role.name,
                description: role.description,
                label: role.label ?? "",
                permissions: role.permissions.map((p: { id: string }) => p.id), // pastikan sesuai
              });
            } catch (err) {
              console.error(err);
              showErrorToast("Gagal memuat data role");
            }
          })();
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [isEdit, id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePermissionToggle = (permId: string) => {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permId)
        ? prev.permissions.filter((id) => id !== permId)
        : [...prev.permissions, permId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Nama role tidak boleh kosong");
      return;
    }
    if (form.permissions.length === 0) {
      setError("Minimal satu permission harus dipilih");
      return;
    }

    try {
      const tab = {
        key: `/pages/roles-${Date.now()}`,
        route: "/pages/roles",
        label: "Daftar roles",
        content: RouteRegistry.get("/pages/roles"),
      };

      if (isEdit) {
        await updateRole(id!, form);
        showSuccessToast("Role berhasil diperbarui");
      } else {
        await createRole(form);
        showSuccessToast("Role berhasil dibuat");
      }

      TabController.replaceTabWithBackStack(tab);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) return <div className="text-white">Loading...</div>;

  return (
    <form onSubmit={handleSubmit} className="p-4 text-white max-w-xl">
      <h1 className="text-2xl font-bold mb-4">
        {isEdit ? "Edit Role" : "Tambah Role"}
      </h1>

      {error && <div className="text-red-400 mb-2">{error}</div>}

      <div className="mb-4">
        <label className="block mb-1">Nama Role</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          className="w-full p-2 bg-gray-700 rounded"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1">Deskripsi</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          className="w-full p-2 bg-gray-700 rounded"
        />
      </div>

      <PermissionForm
        allPermissions={allPermissions}
        form={form}
        setForm={setForm}
        handlePermissionToggle={handlePermissionToggle}
      />

      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
      >
        Simpan
      </button>
    </form>
  );
}
