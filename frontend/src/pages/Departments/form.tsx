import { useEffect, useState } from "react";
import {
  createDepartment,
  getDepartmentById,
  getParentDepartments,
  updateDepartment,
} from "./departments.api";
import { showErrorToast, showSuccessToast } from "../../utils/toast";
import { useRouteParamsFromTab } from "../../hooks/useRouteParams";

type FormData = {
  name: string;
  description: string;
  parent_id?: string | null;
};

export default function DepartmentFormPage() {
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
      showErrorToast(err.message || "Gagal menyimpan departemen");
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
          console.log(data);
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
    <form className="p-4 space-y-4 max-w-xl" onSubmit={handleSubmit}>
      <h1 className="text-xl font-bold">
        {isEdit ? "Edit Departemen" : "Tambah Departemen"}
      </h1>

      <div>
        <label className="block mb-1">Nama</label>
        <input
          className="w-full p-2 bg-gray-800 rounded"
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block mb-1">Deskripsi</label>
        <input
          className="w-full p-2 bg-gray-800 rounded"
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
        />
      </div>

      <div>
        <label className="block mb-1">Parent Departemen (opsional)</label>
        <select
          className="w-full p-2 bg-gray-800 rounded"
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
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 px-4 py-2 rounded text-white disabled:opacity-50"
        >
          {loading ? "Menyimpan..." : "Simpan"}
        </button>
      </div>

      {error && <div className="text-red-500">{error}</div>}
    </form>
  );
}
