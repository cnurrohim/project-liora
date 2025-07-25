import { useEffect, useState } from "react";

import { createUser } from "./user.api";
import type { Role } from "./types";
import { getRoles } from "./role.api";
import { TabController } from "../../components/Tab/controller";
import { RouteRegistry } from "../../config/routeRegistry";
import { showSuccessToast, toastConfirmSuccess } from "../../utils/toast";

export default function UserForm() {
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    roleIds: [] as string[],
    isActive: true,
  });

  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getRoles().then(setRoles).catch(console.error);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions).map(
      (opt) => opt.value
    );
    setForm((prev) => ({ ...prev, roleIds: selected }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await createUser(form);
      toastConfirmSuccess("User berhasil disimpan!");

      const tab = {
        key: `/pages/users-${Date.now()}`,
        route: "/pages/users",
        label: "Daftar Users",
        content: RouteRegistry.get("/pages/users"),
      };
      TabController.replaceTabWithBackStack(tab);

      // redirect atau reset form
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold">Tambah User</h2>

      {error && <div className="text-red-500">{error}</div>}

      <input
        name="name"
        placeholder="Nama"
        value={form.name}
        onChange={handleChange}
        required
        className="input"
      />
      <input
        name="username"
        placeholder="Username"
        value={form.username}
        onChange={handleChange}
        required
        className="input"
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        required
        className="input"
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={form.password}
        onChange={handleChange}
        required
        className="input"
      />

      <select
        multiple
        value={form.roleIds}
        onChange={handleRoleChange}
        className="input h-32"
      >
        {roles.map((role) => (
          <option key={role.id} value={role.id}>
            {role.name}
          </option>
        ))}
      </select>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          name="isActive"
          checked={form.isActive}
          onChange={handleChange}
        />
        Aktif
      </label>

      <button type="submit" disabled={loading} className="btn">
        {loading ? "Menyimpan..." : "Simpan"}
      </button>
    </form>
  );
}
