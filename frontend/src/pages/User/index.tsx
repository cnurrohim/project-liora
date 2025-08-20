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
import {
  getUsers,
  deleteUser,
  toggleActivationUser,
  getUserDetail,
} from "./user.api";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { openTabSmart } from "@/utils/handleMenuClick/openTabSmart";
import { IconRenderer } from "@/components/IconRenderer";
import { EditButtonLink } from "@/components/Buttons/EditButtonLink";
import { DeleteButtonLink } from "@/components/Buttons/DeleteButtonLink";
import { ButtonGroupWithDropdown } from "@/components/Buttons/ButtonGroupWithDropdown";
import { ConfirmationDialogController } from "@/components/ConfirmationDialog/controller";
import { ViewButtonLink } from "@/components/Buttons/ViewButtonLink";
import { ButtonLink } from "@/components/Buttons/ButtonLink";
import { UserDetailPane, UserDetailPaneController } from "./UserDetailPane";
import { usePermissions } from "./permissions";
import ForbiddenPage from "pages/Misc/403";

type User = {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
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
  const { canView, canDelete, canUpdate, canCreate } = usePermissions();

  if (!canView) return <ForbiddenPage />;

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
    if (!canUpdate) {
      showErrorToast("Anda tidak punya hak akses untuk fitur ini!");
      return;
    }

    openTabSmart(
      {
        id: `/user/${user.id}/edit`,
        route: `/user/${user.id}/edit`,
        label: `Edit: ${user.name}`,
        type: "route",
        icon: "RiPencilFill",
      },
      { replace: true }
    );
  };

  const handleView = async (id: string) => {
    try {
      const detail = await getUserDetail(id);
      UserDetailPaneController.open(detail);
    } catch (err) {
      console.error("Gagal ambil data", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!canDelete) {
      showErrorToast("Anda tidak punya hak akses untuk fitur ini!");
      return;
    }

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

  const toggleUserActivation = async (id: string, status: boolean) => {
    if (!canUpdate) {
      showErrorToast("Anda tidak punya hak akses untuk fitur ini!");
      return;
    }

    ConfirmationDialogController.askConfirmation(
      status
        ? "Yakin ingin mengnonaktifkan user ini?"
        : "Yakin ingin mengaktifkan user ini?",
      async () => {
        try {
          await toggleActivationUser(id);
          const msg = status
            ? "User berhasil dinonaktifkan"
            : "User berhasil diaktifkan";
          showSuccessToast(msg);
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
        accessorKey: "is_active",
        header: "Status",
        cell: ({ row }) => {
          return row.original.is_active ? "Aktif" : "Nonaktif";
        },
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
                  className="bg-gray-600 px-2 py-1 rounded text-xs text-gray-300"
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
                  className={`px-2 py-1 rounded text-xs relative ${
                    r.is_default
                      ? "bg-gray-600 text-white"
                      : "bg-gray-600 text-gray-300"
                  }`}
                >
                  {r.name}
                  {r.is_default && (
                    <span className="text-amber-400 ml-1 ">★</span>
                  )}
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
            <ViewButtonLink onClick={() => handleView(row.original.id)} />
            {canUpdate && (
              <EditButtonLink onClick={() => handleEdit(row.original)} />
            )}

            {canUpdate && (
              <ButtonLink
                icon={
                  row.original.is_active ? "RiForbid2Line" : "RiForbid2Line"
                }
                label={row.original.is_active ? "Nonaktifkan" : "Aktifkan"}
                onClick={() =>
                  toggleUserActivation(row.original.id, row.original.is_active)
                }
              />
            )}

            {canDelete && (
              <DeleteButtonLink onClick={() => handleDelete(row.original.id)} />
            )}
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
        id: "/user/create",
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
        {canCreate && (
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
            onClick={() => openInNewTab(false)}
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
        )}
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
                      <td key={cell.id} className="p-2 align-top">
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

      <UserDetailPane />
    </div>
  );
}
