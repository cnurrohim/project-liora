import { useEffect, useState } from "react";

import { showErrorToast, showSuccessToast } from "@/utils/toast";
import {
  createRole,
  getAllPermissions,
  getRoleById,
  updateRole,
} from "./role.api";
import { RouteRegistry } from "@/config/routeRegistry";
import { TabController } from "@/components/Tab/controller";
import PermissionForm from "./permissionForm";
import { useRouteParamsFromTab } from "@/hooks/useRouteParams";
import { usePermissions } from "./permissions";
import ForbiddenPage from "pages/Misc/403";
import { BackToListLink } from "@/components/Buttons/BackToListLink";

export default function RoleFormPage() {
  const { canView, canSubmit, canUpdate, canCreate } = usePermissions();

  if (!canView) return <ForbiddenPage />;

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
              showErrorToast("Failed to load role data");
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

    if (isEdit && !canUpdate) {
      showErrorToast("We're sorry, you don't have access for this feature!");
      return;
    }

    if (!isEdit && !canCreate) {
      showErrorToast("We're sorry, you don't have access for this feature!");
      return;
    }

    setError("");

    if (!form.name.trim()) {
      setError("Role name can't be empty");
      return;
    }
    if (form.permissions.length === 0) {
      setError("Choose minimum one permission");
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
        showSuccessToast("Role updated");
      } else {
        await createRole(form);
        showSuccessToast("Role created");
      }

      TabController.replaceTabWithBackStack(tab);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading)
    return <div className="text-[var(--content-text)]">Loading...</div>;

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4 max-w-3/4 mx-auto">
      <BackToListLink route="/pages/roles" label="list roles" />
      <h1 className="text-2xl font-bold mb-4">
        {isEdit ? "Edit Role" : "Add New Role"}
      </h1>

      {error && <div className="text-[var(--danger)] mb-2">{error}</div>}

      <div className="mb-4">
        <label className="block mb-1">Role Name</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          className="w-full p-2 bg-[var(--content-surface-hover)] rounded"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1">Descriptions</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          className="w-full p-2 bg-[var(--content-surface-hover)] rounded"
        />
      </div>

      <PermissionForm
        allPermissions={allPermissions}
        form={form}
        setForm={setForm}
        handlePermissionToggle={handlePermissionToggle}
      />

      {canSubmit && (
        <button
          type="submit"
          disabled={loading}
          className="w-28 flex justify-center text-[var(--success-foreground)] items-center px-4 py-2 bg-[var(--info)] rounded hover:bg-[var(--info-hover)] disabled:opacity-50 cursor-pointer max-w-3/4"
        >
          {loading ? "Saving..." : "Save"}
        </button>
      )}
    </form>
  );
}
