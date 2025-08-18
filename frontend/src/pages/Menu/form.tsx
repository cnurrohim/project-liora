import { useEffect, useState } from "react";
import {
  createMenu,
  getMenuById,
  getParentMenus,
  updateMenu,
} from "./menu.api";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { RouteRegistry } from "@/config/routeRegistry";
import { useRouteParamsFromTab } from "@/hooks/useRouteParams";
import { CommandRegistry } from "@/config/commandRegistry";
import { IconPicker } from "@/components/IconRenderer/IconPicker";
import { MenuProviderController } from "@/controller/menuProviderController";
import { usePermissions } from "./permissions";
import ForbiddenPage from "pages/Misc/403";
import { MENU } from "@/constants/menu";
import { getAllViewOnlyPermissions } from "./menu.api";
import MultiSelect from "@/components/SelectOptions/MultiSelect";

const modeOptions = [MENU.MODE.SLIDING, MENU.MODE.SLIDING];
const alignmentOptions = [MENU.ALIGNMENT.START, MENU.ALIGNMENT.END];
const typeOptions = [MENU.TYPE.ROUTE, MENU.TYPE.COMMAND, MENU.TYPE.GROUP];

type MenuType = (typeof MENU.TYPE)[keyof typeof MENU.TYPE];

type Option = {
  id: string;
  name: string;
};

type FormData = {
  label: string;
  description: string;
  icon: string;
  icon_color: string | null;
  type: MenuType;
  route?: string;
  command?: string;
  parent_id?: string | null;
  mode?: string;
  alignment?: string;
  permissions: Option[];
};

export default function MenuFormPage() {
  const { canCreate, canUpdate } = usePermissions();

  if (!canCreate && !canUpdate) return <ForbiddenPage />;

  const { id } = useRouteParamsFromTab("/menu/:id/edit");
  const isEdit = !!id;

  const [form, setForm] = useState<FormData>({
    label: "",
    description: "",
    icon: "",
    icon_color: null,
    type: MENU.TYPE.ROUTE,
    route: "",
    command: "",
    parent_id: null,
    mode: MENU.MODE.SLIDING,
    alignment: MENU.ALIGNMENT.START,
    permissions: [],
  });

  const [allMenus, setAllMenus] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [allPermissions, setAllPermissions] = useState<Option[]>([]);

  const handleChange = (
    key: keyof FormData,
    value: string | null | undefined
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleMultiChange = (key: keyof FormData, value: Option[]) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isEdit && !canUpdate) {
      showErrorToast("Anda tidak punya akses untuk mengupdate data ini");
      return;
    }
    if (!isEdit && !canCreate) {
      showErrorToast("Anda tidak punya akses untuk membuat manu baru");
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        await updateMenu(id!, form);
        showSuccessToast("Menu berhasil diperbarui");
        MenuProviderController.load();
        setLoading(false);
      } else {
        await createMenu(form);

        showSuccessToast("Menu berhasil dibuat");
        MenuProviderController.load();
        setLoading(false);
      }
    } catch (err: any) {
      setLoading(false);
      showErrorToast(err.message || "Gagal menyimpan menu");
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const parentMenu = await getParentMenus();
        setAllMenus(parentMenu);

        const permissions = await getAllViewOnlyPermissions(); // <-- Kamu buat di `menu.api.ts`
        setAllPermissions(
          permissions.map((p: any) => ({
            id: p.id,
            name: `${p.domain} ${p.name}`,
          }))
        );

        if (isEdit && id) {
          (async () => {
            try {
              const data = await getMenuById(id);
              setForm({
                label: data.label ?? "",
                description: data.description ?? "",
                icon: data.icon ?? "",
                icon_color: data.icon_color ?? null,
                type: data.type ?? MENU.TYPE.ROUTE,
                route: data.route ?? "",
                command: data.command ?? "",
                parent_id: data.parent_id ?? null,
                mode: data.mode ?? MENU.MODE.SLIDING,
                alignment: data.alignment ?? MENU.ALIGNMENT.START,
                permissions:
                  data.permissions?.map((p: any) => ({
                    id: `${p.id}`,
                    name: `${p.domain} ${p.name}`,
                    value: p.id,
                  })) ?? [],
              });
            } catch (err) {
              console.error(err);
              showErrorToast("Gagal memuat data menu");
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

  const availableRoutes = RouteRegistry.getAllOptions();
  const availableCommands = CommandRegistry.getOptions();

  return (
    <form className="p-4 space-y-4 max-w-xl mb-20" onSubmit={handleSubmit}>
      <h1 className="text-xl font-bold">
        {isEdit ? "Edit Menu" : "Tambah Menu"}
      </h1>

      <div>
        <label className="block mb-1">Label</label>
        <input
          className="w-full p-2 bg-gray-800 rounded"
          value={form.label}
          onChange={(e) => handleChange("label", e.target.value)}
        />
      </div>

      <div>
        <label className="block mb-1">Description</label>
        <input
          className="w-full p-2 bg-gray-800 rounded"
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
        />
      </div>

      <div>
        <label className="block mb-1">Icon</label>
        <IconPicker
          selectedIcon={form.icon}
          onSelect={(iconName) => handleChange("icon", iconName)}
        />
      </div>

      {/* jika ingin atur warna icon, bisa diaktifkan */}
      {/* <div>
        <label className="block mb-1">Icon Color</label>
        <ColorCirclePicker
          color={form.icon_color ?? "#000000"}
          onChange={(newColor) => handleChange("icon_color", newColor)}
        />
      </div> */}

      <div>
        <label className="block mb-1">Tipe</label>
        <select
          className="w-full p-2 bg-gray-800 rounded"
          value={form.type}
          onChange={(e) =>
            handleChange("type", e.target.value as FormData["type"])
          }
        >
          {typeOptions.map((opt) => (
            <option key={opt}>{opt}</option>
          ))}
        </select>
      </div>

      {form.type === "route" && (
        <div>
          <label className="block mb-1">Route</label>
          <select
            className="w-full p-2 bg-gray-800 rounded"
            value={form.route}
            onChange={(e) => handleChange("route", e.target.value)}
          >
            <option value="">(pilih route)</option>
            {availableRoutes.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {form.type === "command" && (
        <div>
          <label className="block mb-1">Command</label>
          <select
            className="w-full p-2 bg-gray-800 rounded"
            value={form.command}
            onChange={(e) => handleChange("command", e.target.value)}
          >
            <option value="">(pilih command)</option>
            {availableCommands.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block mb-1">Parent Menu (opsional)</label>
        <select
          className="w-full p-2 bg-gray-800 rounded"
          value={form.parent_id || ""}
          onChange={(e) => handleChange("parent_id", e.target.value || null)}
        >
          <option value="">(tanpa parent)</option>
          {allMenus
            .filter((m) => m.id !== id)
            .map((menu) => (
              <option key={menu.id} value={menu.id}>
                {menu.label}
              </option>
            ))}
        </select>
      </div>

      {/** SLIDING MODE NOT IMPLEMENTED YET */}
      {/* <div>
        <label className="block mb-1">Mode</label>
        <select
          className="w-full p-2 bg-gray-800 rounded"
          value={form.mode}
          onChange={(e) => handleChange("mode", e.target.value)}
        >
          {modeOptions.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
      </div> */}

      <div>
        <label className="block mb-1">Alignment</label>
        <select
          className="w-full p-2 bg-gray-800 rounded"
          value={form.alignment}
          onChange={(e) => handleChange("alignment", e.target.value)}
        >
          {alignmentOptions.map((a) => (
            <option key={a}>{a}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block mb-1">Permissions</label>
        <MultiSelect
          options={allPermissions}
          value={form.permissions}
          onChange={(val) => handleMultiChange("permissions", val)}
          placeholder="Pilih permission"
        />
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
