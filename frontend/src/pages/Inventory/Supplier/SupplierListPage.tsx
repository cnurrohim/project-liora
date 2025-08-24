// src/pages/suppliers/SupplierListPage.tsx
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
  getSuppliers,
  deleteSupplier,
  getSupplierById,
} from "@/pages/Inventory/Supplier/supplier.api";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { openTabSmart } from "@/utils/handleMenuClick/openTabSmart";
import { IconRenderer } from "@/components/IconRenderer";
import { EditButtonLink } from "@/components/Buttons/EditButtonLink";
import { DeleteButtonLink } from "@/components/Buttons/DeleteButtonLink";
import { ButtonGroupWithDropdown } from "@/components/Buttons/ButtonGroupWithDropdown";
import { ConfirmationDialogController } from "@/components/ConfirmationDialog/controller";
import ForbiddenPage from "pages/Misc/403";
import { usePermissions } from "./permissions"; // sesuaikan modul permissions

type Supplier = {
  id: string;
  name: string;
  contact: string | null;
  address: string | null;
};

export default function SupplierListPage() {
  const { canView, canDelete, canUpdate, canCreate } = usePermissions();

  if (!canView) return <ForbiddenPage />;

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const data = await getSuppliers();
      setSuppliers(data);
    } catch (err: any) {
      setError(err.message || "Gagal memuat data supplier");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const data = useMemo(() => suppliers, [suppliers]);

  const handleEdit = (supplier: Supplier) => {
    if (!canUpdate) {
      showErrorToast("Anda tidak punya hak akses untuk fitur ini!");
      return;
    }

    openTabSmart(
      {
        id: `/suppliers/${supplier.id}/edit`,
        route: `/suppliers/${supplier.id}/edit`,
        label: `Edit: ${supplier.name}`,
        type: "route",
        icon: "RiPencilFill",
      },
      { replace: true }
    );
  };

  const handleView = async (id: string) => {
    try {
      const detail = await getSupplierById(id);
      showSuccessToast(`Supplier: ${detail.name}`);
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
      "Yakin ingin menghapus supplier ini?",
      async () => {
        try {
          await deleteSupplier(id);
          showSuccessToast("Supplier berhasil dihapus");
          fetchSuppliers();
        } catch (err: any) {
          showErrorToast(err.message);
        }
      }
    );
  };

  const columns = useMemo<ColumnDef<Supplier>[]>(
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
        header: "Nama Supplier",
      },
      {
        accessorKey: "contact",
        header: "Kontak",
        cell: ({ row }) => row.original.contact || "-",
      },
      {
        accessorKey: "address",
        header: "Alamat",
        cell: ({ row }) => row.original.address || "-",
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
        id: "/supplier/create",
        route: "/supplier/create",
        label: "Tambah Supplier",
        type: "route",
        icon: "RiAddBoxLine",
      },
      { replace: !newTab, remember: true }
    );
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Daftar Supplier</h1>
        {canCreate && (
          <ButtonGroupWithDropdown
            mainLabel={
              <>
                <IconRenderer
                  name="RiAddBoxLine"
                  size={15}
                  className="text-white"
                />
                Tambah Supplier
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
    </div>
  );
}
