// src/pages/Inventory/StockAdjustmentListPage.tsx
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
  getStockAdjustments,
  getStockAdjustmentDetail,
  confirmStockAdjustment,
  cancelStockAdjustment,
} from "./stockAdjustment.api";
import { openTabSmart } from "@/utils/handleMenuClick/openTabSmart";
import { IconRenderer } from "@/components/IconRenderer";
import { ViewButtonLink } from "@/components/Buttons/ViewButtonLink";
import { ButtonGroupWithDropdown } from "@/components/Buttons/ButtonGroupWithDropdown";
import ForbiddenPage from "pages/Misc/403";
import { usePermissions } from "./permissions";
import {
  StockAdjustmentDetailPane,
  StockAdjustmentDetailPaneController,
} from "./StockAdjustmentDetailPane";
import { ApproveButtonLink } from "@/components/Buttons/ApproveButtonLink";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { ConfirmationDialogController } from "@/components/ConfirmationDialog/controller";
import { CancelButtonLink } from "@/components/Buttons/CancelButtonLink";

type StockAdjustment = {
  id: string;
  adjustment_number: string;
  adjustment_date: string;
  reason?: string | null;
  status: string;
  created_by?: string | null;
};

export default function StockAdjustmentListPage() {
  const { canView, canCreate, canApprove } = usePermissions();

  if (!canView) return <ForbiddenPage />;

  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchAdjustments = async () => {
    setLoading(true);
    try {
      const data = await getStockAdjustments();
      setAdjustments(data);
    } catch (err: any) {
      setError(err.message || "Gagal memuat data Adjustment");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdjustments();
  }, []);

  const data = useMemo(() => adjustments, [adjustments]);

  const handleView = async (id: string) => {
    try {
      const detail = await getStockAdjustmentDetail(id);
      StockAdjustmentDetailPaneController.open(detail);
    } catch (err) {
      console.error("Gagal ambil detail Adjustment", err);
    }
  };

  const handleConfirm = async (id: string) => {
    if (!canApprove) {
      showErrorToast("Anda tidak punya hak akses untuk fitur ini!");
      return;
    }

    ConfirmationDialogController.askConfirmation(
      "Yakin ingin setujui stock adjustment ini?",
      async () => {
        try {
          await confirmStockAdjustment(id);
          showSuccessToast("stock adjustment berhasil disetujui");
          fetchAdjustments();
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
      "Yakin ingin membatalkan stock adjustment ini?",
      async () => {
        try {
          await cancelStockAdjustment(id);
          showSuccessToast("stock adjustment berhasil dibatalkan");
          fetchAdjustments();
        } catch (err: any) {
          showErrorToast(err.message);
        }
      }
    );
  };

  const columns = useMemo<ColumnDef<StockAdjustment>[]>(
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
        accessorKey: "adjustment_number",
        header: "Nomor Adjustment",
      },
      {
        accessorKey: "adjustment_date",
        header: "Tanggal",
        cell: ({ row }) =>
          new Date(row.original.adjustment_date).toLocaleDateString(),
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

            {canApprove && row.original.status === "draft" && (
              <ApproveButtonLink
                onClick={() => handleConfirm(row.original.id)}
                className={`flex cursor-pointer hover:bg-blue-500 px-2 py-1 rounded text-white text-xs font-semibold bg-blue-400`}
              />
            )}
          </div>
        ),
      },
      {
        accessorKey: "reason",
        header: "Reason",
        cell: ({ row }) => row.original.reason || "-",
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
            {canApprove && row.original.status === "draft" && (
              <CancelButtonLink
                onClick={() => handleCancel(row.original.id)}
                className={`flex gap-1 cursor-pointer hover:bg-amber-500 px-2 py-1 rounded text-white text-xs font-semibold bg-amber-600`}
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
        id: "/stock-adjustment/create",
        route: "/stock-adjustment/create",
        label: "Tambah Adjustment",
        type: "route",
        icon: "RiArrowRightUpBoxLine",
      },
      { replace: !newTab, remember: true }
    );
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Stock Adjustment List</h1>
        {canCreate && (
          <ButtonGroupWithDropdown
            mainLabel={
              <>
                <IconRenderer
                  name="RiAddBoxLine"
                  size={15}
                  className="text-white"
                />
                Tambah Adjustment
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
      <StockAdjustmentDetailPane />
    </div>
  );
}
