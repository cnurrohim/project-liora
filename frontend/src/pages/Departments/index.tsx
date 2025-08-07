import { useEffect, useMemo, useState } from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  getExpandedRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { deleteDepartment, getDepartments } from "./departments.api";
import { ConfirmationDialogController } from "@/components/ConfirmationDialog/controller";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { openTabSmart } from "@/utils/handleMenuClick/openTabSmart";
import { EditButtonLink } from "@/components/Buttons/EditButtonLink";
import { DeleteButtonLink } from "@/components/Buttons/DeleteButtonLink";
import { ButtonGroupWithDropdown } from "@/components/Buttons/ButtonGroupWithDropdown";
import { IconRenderer } from "@/components/IconRenderer";
import ForbiddenPage from "pages/Misc/403";
import { useDepartmentPermissions } from "./permissions";

type Department = {
  id: string;
  name: string;
  parent_id: string | null;
  items?: Department[]; // for tree
};

export default function DepartmentListPage() {
  const { canView, canDelete, canUpdate } = useDepartmentPermissions();
  if (!canView) return <ForbiddenPage />;

  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await getDepartments();
      setDepartments(res);
    } catch (err: any) {
      setError(err.message || "Gagal memuat department");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    ConfirmationDialogController.askConfirmation(
      "Yakin ingin menghapus department ini?",
      async () => {
        try {
          await deleteDepartment(id);
          showSuccessToast("Department berhasil dihapus");
          fetchDepartments();
        } catch (err: any) {
          showErrorToast(err.message);
        }
      }
    );
  };

  const handleEdit = (department: Department) => {
    openTabSmart(
      {
        route: `/departments/${department.id}/edit`,
        label: `Edit: ${department.name}`,
        type: "route",
        icon: "RiPencilFill",
      },
      { replace: true }
    );
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const treeData = useMemo(() => buildTree(departments), [departments]);

  const columns = useMemo<ColumnDef<Department>[]>(
    () => [
      {
        id: "number",
        header: () => <div className="text-left">#</div>,
        size: 50,
        cell: ({ row }) => (
          <div
            style={{ paddingLeft: `${row.depth * 8}px` }}
            className="flex items-center gap-2"
          >
            {row.index + 1}
          </div>
        ),
      },
      {
        accessorKey: "name",
        header: "Nama Department",
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
                <div>{row.getValue("name")} </div>
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
            {!row.getCanExpand() && row.getValue("name")}
          </div>
        ),
      },

      {
        accessorKey: "description",
        header: "Deskripsi",
        cell: ({ row }) => (
          <div
            style={{ paddingLeft: `${row.depth * 20}px` }}
            className="flex items-center"
          >
            {row.getValue("description")}
          </div>
        ),
      },

      {
        id: "aksi",
        header: "Aksi",
        cell: ({ row }) => (
          <div className="flex gap-1">
            {canUpdate && (
              <EditButtonLink onClick={() => handleEdit(row.original)} />
            )}
            {canDelete && (
              <DeleteButtonLink onClick={() => handleDelete(row.original.id)} />
            )}
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: treeData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSubRows: (row) => row.items ?? [],
  });

  const openCreateTab = (newTab = false) => {
    openTabSmart(
      {
        route: "/departments/create",
        label: "Tambah Department",
        type: "route",
        icon: "RiApps2AddFill",
      },
      { replace: !newTab, remember: true }
    );
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Daftar Department</h1>
        <ButtonGroupWithDropdown
          mainLabel={
            <>
              <IconRenderer name="RiApps2AddFill" size={15} />
              Tambah Departement
            </>
          }
          onClick={() => openCreateTab(false)}
          dropdownItems={[
            {
              label: (
                <>
                  <IconRenderer name="RiArrowRightUpLine" size={15} />
                  Open in new tab
                </>
              ),
              onClick: () => openCreateTab(true),
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
            <thead className="bg-gray-800 text-white">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      style={
                        header.column.id === "number"
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
      )}
    </div>
  );
}

function buildTree(items: Department[]): Department[] {
  const map = new Map<string, Department & { items: Department[] }>();
  const roots: Department[] = [];

  items.forEach((item) => {
    map.set(item.id, { ...item, items: [] });
  });

  map.forEach((item) => {
    if (item.parent_id) {
      const parent = map.get(item.parent_id);
      if (parent) parent.items.push(item);
    } else {
      roots.push(item);
    }
  });

  return roots;
}
