import { useEffect, useState } from "react";
import { deleteMenu, getMenus, handleReorder } from "./menu.api";
import { showErrorToast, showSuccessToast } from "../../utils/toast";
import { openTabSmart } from "../../utils/handleMenuClick/openTabSmart";
import { IconRenderer } from "../../components/IconRenderer";
import { ButtonGroupWithDropdown } from "../../components/Buttons/ButtonGroupWithDropdown";
import { EditButtonLink } from "../../components/Buttons/EditButtonLink";
import { DeleteButtonLink } from "../../components/Buttons/DeleteButtonLink";

type MenuItem = {
  id: string;
  label: string;
  type: "route" | "command" | "group";
  icon?: string;
  route?: string;
  command?: string;
  parent_id?: string | null;
  mode?: string;
  alignment?: string;
  ordinal: number;
};

export default function MenuListPage() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchMenus = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getMenus();
      setMenus(data);
    } catch (err: any) {
      setError(err.message || "Gagal memuat menu");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus menu ini?")) return;
    try {
      await deleteMenu(id);
      showSuccessToast("Menu berhasil dihapus");
      fetchMenus();
    } catch (err: any) {
      showErrorToast(err.message);
    }
  };

  const handleEdit = (menu: MenuItem) => {
    openTabSmart({
      route: `/menu/${menu.id}/edit`,
      label: `Edit: ${menu.label}`,
      type: "route",
    });
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  function openInNewTab(newTab: boolean = false) {
    openTabSmart(
      {
        route: "/menu/create",
        label: "Tambah Menu",
        type: "route",
      },
      { replace: !newTab, remember: true }
    );
  }

  const handleMove = async (id: string, isLiftUp: boolean) => {
    try {
      console.log(id);
      await handleReorder(id, isLiftUp);
      fetchMenus(); // refresh
    } catch (err: any) {
      showErrorToast(err.message || "Gagal mengubah urutan");
    }
  };

  const sortedItems = menus
    .filter((item) => item.parent_id === null) // atau parent tertentu
    .sort((a, b) => a.ordinal - b.ordinal);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Daftar Menu</h1>

        <ButtonGroupWithDropdown
          mainLabel={
            <>
              <IconRenderer
                name="RiApps2AddLine"
                size={15}
                className="text-white"
              />
              Tambah Menu
            </>
          }
          onMainClick={() => openInNewTab(false)}
          dropdownItems={[
            {
              label: (
                <>
                  <IconRenderer
                    name="RiArrowRightUpBoxLine"
                    size={15}
                    className="text-white"
                  />
                  Open in new tab
                </>
              ),
              onClick: () => openInNewTab(true),
            },
          ]}
        />
      </div>

      {error && <div className="text-red-500 mb-2">{error}</div>}

      {loading ? (
        <div>Memuat...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-800 text-left text-white">
                <th className="p-2">#</th>
                <th className="p-2">Label</th>
                <th className="p-2">Type</th>
                <th className="p-2">Icon</th>
                <th className="p-2">Route / Command</th>
                <th className="p-2">Mode</th>
                <th className="p-2">Alignment</th>
                <th className="p-2">Aksi</th>
                <th className="p-2">Urutan</th>
              </tr>
            </thead>
            <tbody>
              {sortedItems.map((menu, index) => (
                <tr key={menu.id} className="border-b border-gray-700">
                  <td className="p-2">{menu.ordinal}</td>
                  <td className="p-2">{menu.label}</td>
                  <td className="p-2">{menu.type}</td>
                  <td className="p-2">
                    <IconRenderer
                      name={menu.icon}
                      size={20}
                      className="text-white"
                    />
                  </td>
                  <td className="p-2">
                    {menu.type === "route" ? menu.route : menu.command}
                  </td>
                  <td className="p-2">{menu.mode}</td>
                  <td className="p-2">{menu.alignment}</td>
                  <td className="p-2 space-x-2 flex flex-row items-center gap-1">
                    <EditButtonLink onMainClick={() => handleEdit(menu)} />

                    <DeleteButtonLink
                      onMainClick={() => handleDelete(menu.id)}
                    />
                  </td>
                  <td className="p-2">
                    {index > 0 && (
                      <button
                        className="cursor-pointer text-white hover:text-green-500"
                        onClick={() => handleMove(menu.id, true)}
                      >
                        <IconRenderer
                          name="RiArrowUpBoxFill"
                          size={20}
                          className=""
                        />{" "}
                      </button>
                    )}
                    {index < sortedItems.length - 1 && (
                      <button
                        className="cursor-pointer text-white hover:text-red-500"
                        onClick={() => handleMove(menu.id, false)}
                      >
                        <IconRenderer
                          name="RiArrowDownBoxLine"
                          size={20}
                          className=""
                        />{" "}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
