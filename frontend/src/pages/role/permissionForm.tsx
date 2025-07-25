// src/pages/role/permissionForm.tsx

import { useMemo, useState } from "react";
import {
  PermissionController,
  type Permission,
} from "../../controller/permissionController";

export type FormType = {
  name: string;
  description: string;
  label: string;
  permissions: string[];
};

export default function PermissionForm({
  allPermissions,
  form,
  setForm,
  handlePermissionToggle,
}: {
  allPermissions: Permission[];
  form: FormType;
  setForm: React.Dispatch<React.SetStateAction<FormType>>;
  handlePermissionToggle: (id: string) => void;
}) {
  const [search, setSearch] = useState("");
  const grouped = useMemo(
    () => PermissionController.groupPermissionsByDomain(allPermissions),
    [allPermissions]
  );

  return (
    <div className="mb-4">
      <label className="block mb-2 font-bold">Permissions</label>

      <input
        type="text"
        className="mb-4 px-3 py-2 w-full bg-gray-800 text-white rounded"
        placeholder="Cari permission..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="space-y-4">
        {grouped.map((group) => {
          const filtered = group.permissions.filter(
            (p) =>
              p.label.toLowerCase().includes(search.toLowerCase()) ||
              p.name.toLowerCase().includes(search.toLowerCase())
          );

          if (filtered.length === 0) return null;

          return (
            <details key={group.domain} className="bg-gray-900 rounded">
              <summary className="cursor-pointer px-4 py-2 bg-gray-800 font-semibold">
                {group.domain}
                <span className="text-sm ml-2 text-gray-400">
                  ({filtered.length})
                </span>
              </summary>

              <div className="p-4 grid grid-cols-2 gap-2">
                <label className="col-span-2">
                  <input
                    type="checkbox"
                    checked={filtered.every((p) =>
                      form.permissions.includes(p.id)
                    )}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      const ids = filtered.map((p) => p.id);
                      setForm((prev) => ({
                        ...prev,
                        permissions: checked
                          ? Array.from(new Set([...prev.permissions, ...ids]))
                          : prev.permissions.filter((id) => !ids.includes(id)),
                      }));
                    }}
                  />{" "}
                  <span className="font-semibold text-sm text-white/90">
                    Pilih semua di {group.domain}
                  </span>
                </label>

                {filtered.map((perm) => (
                  <label key={perm.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.permissions.includes(perm.id)}
                      onChange={() => handlePermissionToggle(perm.id)}
                    />
                    <span className="text-sm">{perm.label}</span>
                  </label>
                ))}
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
