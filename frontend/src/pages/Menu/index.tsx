import { useEffect, useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  getSortedRowModel,
  getPaginationRowModel,
  type SortingState,
  getExpandedRowModel,
} from "@tanstack/react-table";
import { deleteMenu, getMenus, handleReorder } from "./menu.api";
import { showErrorToast, showSuccessToast } from "../../utils/toast";
import { openTabSmart } from "../../utils/handleMenuClick/openTabSmart";
import { IconRenderer } from "../../components/IconRenderer";
import { EditButtonLink } from "../../components/Buttons/EditButtonLink";
import { DeleteButtonLink } from "../../components/Buttons/DeleteButtonLink";
import { ButtonGroupWithDropdown } from "../../components/Buttons/ButtonGroupWithDropdown";
import { MenuProviderController } from "../../controller/menuProviderController";
import { ConfirmationDialogController } from "../../components/ConfirmationDialog/controller";

type MenuItem = {
  id: string;
  label: string;
  type: "route" | "command" | "group";
  icon?: string;
  icon_color?: string;
  route?: string;
  command?: string;
  parent_id?: string | null;
  mode?: string;
  alignment?: string;
  ordinal: number;
  items?: MenuItem[];
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
    ConfirmationDialogController.askConfirmation(
      "Yakin ingin menghapus menu ini?",
      async () => {
        try {
          await deleteMenu(id);
          showSuccessToast("Menu berhasil dihapus");
          fetchMenus();
          MenuProviderController.load();
        } catch (err: any) {
          showErrorToast(err.message);
        }
      }
    );
  };

  const handleEdit = (menu: MenuItem) => {
    openTabSmart(
      {
        route: `/menu/${menu.id}/edit`,
        label: `Edit: ${menu.label}`,
        type: "route",
        icon: "RiPencilFill",
        // icon: <IconRenderer name="RiPencilFill" size={15} />,
      },
      { replace: true }
    );
  };

  const handleMove = async (id: string, isMoveMenuUP: boolean) => {
    try {
      await handleReorder(id, isMoveMenuUP);
      fetchMenus(); // refresh
      MenuProviderController.load();
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
        header: () => <div className="text-left">#</div>,
        size: 50,
        cell: ({ row }) => (
          <div
            style={{ paddingLeft: `${row.depth * 8}px` }}
            className="flex items-center gap-2"
          >
            {row.getValue("ordinal")}
          </div>
        ),
      },
      {
        accessorKey: "label",
        header: "Label",
        cell: ({ row }) => (
          <div
            style={{ paddingLeft: `${row.depth * 20}px` }}
            className="flex items-center gap-2"
          >
            {row.getCanExpand() && (
              <button
                onClick={row.getToggleExpandedHandler()}
                className="flex flex-row justify-between w-full cursor-pointer"
              >
                <div>{row.getValue("label")} </div>
                <div>
                  {row.getIsExpanded() ? (
                    <div className=" text-gray-400 w-6 h-6 rounded-full flex items-center justify-center text-sm">
                      <IconRenderer name="RiArrowUpWideFill" size={20} />
                    </div>
                  ) : (
                    <div className="text-gray-300 w-6 h-6 rounded-full flex items-center justify-center text-sm">
                      <IconRenderer name="RiArrowDownWideFill" size={20} />
                    </div>
                  )}
                </div>
              </button>
            )}
            {!row.getCanExpand() && row.getValue("label")}
          </div>
        ),
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
            color={row.original.icon_color}
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
          const parentId = row.original.parent_id ?? null;

          const siblingRows = table
            .getExpandedRowModel()
            .rows.filter((r) => (r.original.parent_id ?? null) === parentId);

          const index = siblingRows.findIndex(
            (r) => r.original.id === row.original.id
          );

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
              {index < siblingRows.length - 1 && (
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

  const treeData = useMemo(() => buildTree(data), [data]);

  const table = useReactTable({
    data: treeData,
    columns,
    state: {
      sorting,
    },
    initialState: {
      pagination: {
        pageIndex: 0, //custom initial page index
        pageSize: 15, //custom default page size
      },
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSubRows: (row) => row.items ?? [],
  });

  const openInNewTab = (newTab = false) => {
    openTabSmart(
      {
        route: "/menu/create",
        label: "Tambah Menu",
        type: "route",
        icon: "RiApps2AddLine",
        // icon: <IconRenderer name="RiApps2AddLine" size={15} />,
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
                        style={
                          header.column.id === "ordinal"
                            ? { width: "40px" }
                            : undefined
                        }
                        className="p-2 text-left cursor-pointer select-none"
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

type MenuItemWithChildren = MenuItem & { children?: MenuItemWithChildren[] };

function buildTree(items: MenuItem[]): MenuItemWithChildren[] {
  const map = new Map<string, MenuItemWithChildren>();

  const roots: MenuItemWithChildren[] = [];

  items.forEach((item) => {
    map.set(item.id, { ...item, children: [] });
  });

  map.forEach((item) => {
    if (item.parent_id) {
      const parent = map.get(item.parent_id);
      if (parent) parent.children!.push(item);
    } else {
      roots.push(item);
    }
  });

  // Urutkan berdasarkan ordinal
  const sortTree = (nodes: MenuItemWithChildren[]) => {
    nodes.sort((a, b) => a.ordinal - b.ordinal);
    nodes.forEach((child) => sortTree(child.children!));
  };

  sortTree(roots);
  return roots;
}
