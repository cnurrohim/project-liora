import { useEffect, useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { getUsers, deleteUser } from "./user.api";
import { showErrorToast, showSuccessToast } from "../../utils/toast";
import { openTabSmart } from "../../utils/handleMenuClick/openTabSmart";
import { IconRenderer } from "../../components/IconRenderer";
import { EditButtonLink } from "../../components/Buttons/EditButtonLink";
import { DeleteButtonLink } from "../../components/Buttons/DeleteButtonLink";
import { ButtonGroupWithDropdown } from "../../components/Buttons/ButtonGroupWithDropdown";
import { ConfirmationDialogController } from "../../components/ConfirmationDialog/controller";

type User = {
  id: string;
  name: string;
  email: string;
  roles: {
    id: string;
    name: string;
    is_default: boolean;
  }[];
  departments: {
    id: string;
    name: string;
    description: string | null;
  }[];
};

export default function UserListPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || "Gagal memuat user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const data = useMemo(() => users, [users]);

  const handleEdit = (user: User) => {
    openTabSmart(
      {
        route: `/user/${user.id}/edit`,
        label: `Edit: ${user.name}`,
        type: "route",
        icon: "RiPencilFill",
      },
      { replace: true }
    );
  };

  const handleDelete = async (id: string) => {
    ConfirmationDialogController.askConfirmation(
      "Yakin ingin menghapus user ini?",
      async () => {
        try {
          await deleteUser(id);
          showSuccessToast("User berhasil dihapus");
          fetchUsers();
        } catch (err: any) {
          showErrorToast(err.message);
        }
      }
    );
  };

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        id: "number",
        header: () => <div className="text-left">#</div>,
        cell: ({ row }) => {
          const { pageIndex, pageSize } = table.getState().pagination;
          return <div>{pageIndex * pageSize + row.index + 1}</div>;
        },
        size: 50,
      },
      {
        accessorKey: "name",
        header: "Nama",
      },
      {
        accessorKey: "email",
        header: "Email",
      },
      {
        accessorKey: "departments",
        header: "Departments",
        cell: ({ row }) => {
          const departments = row.original.departments as { name: string }[];
          return (
            <div className="flex flex-wrap gap-1">
              {departments.map((d) => (
                <span
                  key={d.name}
                  className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-800"
                >
                  {d.name}
                </span>
              ))}
            </div>
          );
        },
      },
      {
        accessorKey: "roles",
        header: "Roles",
        cell: ({ row }) => {
          const roles = row.original.roles as {
            name: string;
            is_default: boolean;
          }[];
          return (
            <div className="flex flex-wrap gap-1">
              {roles.map((r) => (
                <span
                  key={r.name}
                  className={`px-2 py-1 rounded text-xs ${
                    r.is_default
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {r.name}
                  {r.is_default && " ★"}
                </span>
              ))}
            </div>
          );
        },
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
    ],
    [data]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 15,
      },
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const openInNewTab = (newTab = false) => {
    openTabSmart(
      {
        route: "/user/create",
        label: "Tambah User",
        type: "route",
        icon: "RiUserAddLine",
      },
      { replace: !newTab, remember: true }
    );
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Daftar User</h1>
        <ButtonGroupWithDropdown
          mainLabel={
            <>
              <IconRenderer
                name="RiUserAddLine"
                size={15}
                className="text-white"
              />
              Tambah User
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
