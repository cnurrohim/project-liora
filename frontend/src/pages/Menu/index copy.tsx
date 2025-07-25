import { useEffect, useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  getSortedRowModel,
  getPaginationRowModel,
  type SortingState,
} from "@tanstack/react-table";
import { deleteMenu, getMenus, handleReorder } from "./menu.api";
import { showErrorToast, showSuccessToast } from "../../utils/toast";
import { openTabSmart } from "../../utils/handleMenuClick/openTabSmart";
import { IconRenderer } from "../../components/IconRenderer";
import { EditButtonLink } from "../../components/Buttons/EditButtonLink";
import { DeleteButtonLink } from "../../components/Buttons/DeleteButtonLink";
import { ButtonGroupWithDropdown } from "../../components/Buttons/ButtonGroupWithDropdown";

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
  const [sorting, setSorting] = useState<SortingState>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchMenus = async () => {
    setLoading(true);
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

  const handleMove = async (id: string, isLiftUp: boolean) => {
    try {
      await handleReorder(id, isLiftUp);
      fetchMenus(); // refresh
    } catch (err: any) {
      showErrorToast(err.message || "Gagal mengubah urutan");
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const data = useMemo(() => {
    return menus
      .filter((item) => item.parent_id === null)
      .sort((a, b) => a.ordinal - b.ordinal);
  }, [menus]);

  const columns = useMemo<ColumnDef<MenuItem>[]>(
    () => [
      {
        accessorKey: "ordinal",
        header: "#",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "label",
        header: "Label",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "type",
        header: "Type",
      },
      {
        accessorKey: "icon",
        header: "Icon",
        cell: ({ row }) => (
          <IconRenderer
            name={row.original.icon}
            size={20}
            className="text-white"
          />
        ),
      },
      {
        accessorKey: "route",
        header: "Route / Command",
        cell: ({ row }) =>
          row.original.type === "route"
            ? row.original.route
            : row.original.command,
      },
      {
        accessorKey: "mode",
        header: "Mode",
      },
      {
        accessorKey: "alignment",
        header: "Alignment",
      },
      {
        id: "aksi",
        header: "Aksi",
        cell: ({ row }) => (
          <div className="flex gap-1">
            <EditButtonLink onMainClick={() => handleEdit(row.original)} />
            <DeleteButtonLink
              onMainClick={() => handleDelete(row.original.id)}
            />
          </div>
        ),
      },
      {
        id: "urutan",
        header: "Urutan",
        cell: ({ row, table }) => {
          const index = table
            .getSortedRowModel()
            .rows.findIndex((r) => r.id === row.id);
          return (
            <div className="flex gap-1">
              {index > 0 && (
                <button
                  onClick={() => handleMove(row.original.id, true)}
                  className="hover:text-green-500"
                >
                  <IconRenderer name="RiArrowUpBoxFill" size={18} />
                </button>
              )}
              {index < data.length - 1 && (
                <button
                  onClick={() => handleMove(row.original.id, false)}
                  className="hover:text-red-500"
                >
                  <IconRenderer name="RiArrowDownBoxLine" size={18} />
                </button>
              )}
            </div>
          );
        },
      },
    ],
    [data]
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const openInNewTab = (newTab = false) => {
    openTabSmart(
      {
        route: "/menu/create",
        label: "Tambah Menu",
        type: "route",
      },
      { replace: !newTab, remember: true }
    );
  };

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
                  <IconRenderer name="RiArrowRightUpBoxLine" size={15} />
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
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-800 text-white">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="p-2 cursor-pointer select-none"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: " ↑",
                          desc: " ↓",
                        }[header.column.getIsSorted() as string] ?? null}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-b border-gray-700">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="p-2">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-4 text-sm">
            <div>
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="space-x-2">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="px-2 py-1 bg-gray-700 text-white rounded disabled:opacity-50"
              >
                Prev
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="px-2 py-1 bg-gray-700 text-white rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
