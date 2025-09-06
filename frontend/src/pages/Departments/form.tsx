import { useEffect, useState } from "react";
import {
  createDepartment,
  getDepartmentById,
  getParentDepartments,
  updateDepartment,
} from "./departments.api";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { useRouteParamsFromTab } from "@/hooks/useRouteParams";
import { useDepartmentPermissions } from "./permissions";
import ForbiddenPage from "../Misc/403";
import { BackToListLink } from "@/components/Buttons/BackToListLink";

type FormData = {
  name: string;
  description: string;
  parent_id?: string | null;
};

export default function DepartmentFormPage() {
  const { canView, canCreate, canUpdate, canSubmit } =
    useDepartmentPermissions();

  if (!canView) return <ForbiddenPage />;
  const { id } = useRouteParamsFromTab("/departments/:id/edit");
  const isEdit = !!id;

  const [form, setForm] = useState<FormData>({
    name: "",
    description: "",
    parent_id: null,
  });

  const [allDepartments, setAllDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    key: keyof FormData,
    value: string | null | undefined
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canSubmit) return;
    if (isEdit && !canUpdate) {
      showSuccessToast("Anda tidak punya akses untuk mengedit");
      return;
    }
    if (!isEdit && !canCreate) {
      showSuccessToast("Anda tidak punya akses untuk membuat department baru");
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        await updateDepartment(id!, form);
        showSuccessToast("Departemen berhasil diperbarui");
      } else {
        await createDepartment(form);
        showSuccessToast("Departemen berhasil dibuat");
      }
    } catch (err: any) {
      showErrorToast(err.message || "Gagal Saving departemen");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const parents = await getParentDepartments();
        setAllDepartments(parents);

        if (isEdit && id) {
          const data = await getDepartmentById(id);
          setForm({
            name: data.name ?? "",
            description: data.description ?? "",
            parent_id: data.parent_id ?? null,
          });
        }
      } catch (err: any) {
        setError(err.message);
        console.warn("parents", err.message);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [isEdit, id]);

  return (
    <>
      <form
        className="p-6 max-w-3/4 mx-auto space-y-6 "
        onSubmit={handleSubmit}
      >
        <BackToListLink route="/pages/departments" label="list departments" />

        <h1 className="text-xl font-bold">
          {isEdit ? "Edit Department" : "Add Department"}
        </h1>

        <div>
          <label className="block mb-1">Department Name</label>
          <input
            className="w-full p-2 bg-[var(--background)] rounded"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-1">Description</label>
          <input
            className="w-full p-2 bg-[var(--background)] rounded"
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1">
            Parent Department{" "}
            <span className="text-[var(--text-muted)]">(optional)</span>{" "}
          </label>
          <select
            className="w-full p-2 bg-[var(--background)] rounded"
            value={form.parent_id || ""}
            onChange={(e) => handleChange("parent_id", e.target.value || null)}
          >
            <option value="">(tanpa parent)</option>
            {allDepartments
              .filter((dept) => dept.id !== id)
              .map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
          </select>
        </div>

        <div className="pt-4">
          {canSubmit && (
            <button
              type="submit"
              disabled={loading}
              className="w-28 flex justify-center text-[var(--success-foreground)] items-center px-4 py-2 bg-[var(--info)] rounded hover:bg-[var(--info-hover)] disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          )}
        </div>

        {error && <div className="text-[var(--danger)]">{error}</div>}
      </form>
    </>
  );
}
