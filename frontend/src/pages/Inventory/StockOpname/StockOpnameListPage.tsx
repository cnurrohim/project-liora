// src/pages/Inventory/StockOpnameListPage.tsx
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
  getStockOpnames,
  getStockOpnameDetail,
  cancelStockOpname,
  finalizeStockOpname,
} from "./stockOpname.api";
import { openTabSmart } from "@/utils/handleMenuClick/openTabSmart";
import { IconRenderer } from "@/components/IconRenderer";
import { ViewButtonLink } from "@/components/Buttons/ViewButtonLink";
import { ButtonGroupWithDropdown } from "@/components/Buttons/ButtonGroupWithDropdown";
import ForbiddenPage from "pages/Misc/403";
import { usePermissions } from "./permissions";
import {
  StockOpnameDetailPane,
  StockOpnameDetailPaneController,
} from "./StockOpnameDetailPane";
import { ApproveButtonLink } from "@/components/Buttons/ApproveButtonLink";
import { CancelButtonLink } from "@/components/Buttons/CancelButtonLink";
import { ConfirmationDialogController } from "@/components/ConfirmationDialog/controller";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { EditButtonLink } from "@/components/Buttons/EditButtonLink";
import { PreviewButtonLink } from "@/components/Buttons/ReviewButtonLink";

type StockOpname = {
  id: string;
  opname_number: string;
  opname_date: string;
  status: string;
  notes?: string | null;
  created_by?: string | null;
};

export default function StockOpnameListPage() {
  const { canView, canCreate, canApprove, canUpdate, canReview } =
    usePermissions();

  if (!canView) return <ForbiddenPage />;

  const [opnames, setOpnames] = useState<StockOpname[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchOpnames = async () => {
    setLoading(true);
    try {
      const data = await getStockOpnames();
      setOpnames(data);
    } catch (err: any) {
      setError(err.message || "Gagal memuat data Stock Opname");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpnames();
  }, []);

  const data = useMemo(() => opnames, [opnames]);

  const handleView = async (id: string) => {
    try {
      const detail = await getStockOpnameDetail(id);
      StockOpnameDetailPaneController.open(detail);
    } catch (err) {
      console.error("Gagal ambil detail Stock Opname", err);
    }
  };

  const handleConfirm = async (id: string) => {
    if (!canApprove) {
      showErrorToast("Anda tidak punya hak akses untuk fitur ini!");
      return;
    }
    ConfirmationDialogController.askConfirmation(
      "Yakin ingin finalisasi stock opname ini, stock akan berubah mengikuti hasil opname?",
      async () => {
        try {
          await finalizeStockOpname(id);
          showSuccessToast("Stock opname berhasil difinalisasi");
          fetchOpnames();
        } catch (err: any) {
          showErrorToast(err.message);
        }
      }
    );
  };

  const handleCancel = async (id: string) => {
    if (!canApprove) {
      showErrorToast("Anda tidak punya hak akses untuk fitur ini!");
      return;
    }
    ConfirmationDialogController.askConfirmation(
      "Yakin ingin membatalkan stock opname ini?",
      async () => {
        try {
          await cancelStockOpname(id);
          showSuccessToast("Stock opname berhasil dibatalkan");
          fetchOpnames();
        } catch (err: any) {
          showErrorToast(err.message);
        }
      }
    );
  };

  const handleEdit = async (so: StockOpname) => {
    if (!canUpdate) {
      showErrorToast("Anda tidak punya hak akses untuk fitur ini!");
      return;
    }

    openTabSmart(
      {
        id: `/stock-opname/${so.id}/edit`,
        route: `/stock-opname/${so.id}/edit`,
        label: `Edit: ${so.opname_number}`,
        type: "route",
        icon: "RiPencilFill",
      },
      { replace: true }
    );
  };

  const handleReview = async (so: StockOpname) => {
    if (!canReview) {
      showErrorToast("Anda tidak punya hak akses untuk fitur ini!");
      return;
    }

    openTabSmart(
      {
        id: `/stock-opname/${so.id}/review`,
        route: `/stock-opname/${so.id}/review`,
        label: `Review: ${so.opname_number}`,
        type: "route",
        icon: "RiMenuSearchLine",
      },
      { replace: true }
    );
  };

  const columns = useMemo<ColumnDef<StockOpname>[]>(
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
        accessorKey: "opname_number",
        header: "Nomor Opname",
      },
      {
        accessorKey: "opname_date",
        header: "Tanggal",
        cell: ({ row }) =>
          new Date(row.original.opname_date).toLocaleDateString(),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <span
              className={`px-2 py-0.5 rounded text-xs ${
                row.original.status === "confirmed"
                  ? "bg-emerald-700 text-white"
                  : "bg-gray-700 text-gray-300"
              }`}
            >
              {row.original.status}
            </span>

            {canReview && row.original.status === "draft" && (
              <PreviewButtonLink onClick={() => handleReview(row.original)} />
            )}

            {canApprove && row.original.status === "reviewed" && (
              <ApproveButtonLink
                label="Finalized"
                onClick={() => handleConfirm(row.original.id)}
              />
            )}
          </div>
        ),
      },
      {
        accessorKey: "notes",
        header: "Notes",
        cell: ({ row }) => row.original.notes || "-",
      },
      {
        accessorKey: "created_by",
        header: "Created By",
        cell: ({ row }) => row.original.created_by || "-",
      },
      {
        id: "aksi",
        header: "Aksi",
        cell: ({ row }) => (
          <div className="flex gap-1">
            <ViewButtonLink onClick={() => handleView(row.original.id)} />

            {(row.original.status === "draft" ||
              row.original.status === "reviewed") && (
              <EditButtonLink onClick={() => handleEdit(row.original)} />
            )}

            {canApprove &&
              (row.original.status === "draft" ||
                row.original.status === "reviewed") && (
                <CancelButtonLink
                  onClick={() => handleCancel(row.original.id)}
                />
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
        id: "/stock-opname/create",
        route: "/stock-opname/create",
        label: "Create New Opname",
        type: "route",
        icon: "RiArrowRightUpBoxLine",
      },
      { replace: !newTab, remember: true }
    );
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Stock Opname List</h1>
        {canCreate && (
          <ButtonGroupWithDropdown
            mainLabel={
              <>
                <IconRenderer
                  name="RiAddBoxLine"
                  size={15}
                  className="text-white"
                />
                Create New Opname
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
      <StockOpnameDetailPane />
    </div>
  );
}
