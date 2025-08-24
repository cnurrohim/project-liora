// src/pages/purchase-orders/PurchaseOrderListPage.tsx
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
  getPurchaseOrders,
  deletePurchaseOrder,
  approvePurchaseOrder,
  getPurchaseOrderDetail,
  cancelPurchaseOrder,
} from "@/pages/Inventory/PurchaseOrder/purchaseOrder.api";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { openTabSmart } from "@/utils/handleMenuClick/openTabSmart";
import { IconRenderer } from "@/components/IconRenderer";
import { EditButtonLink } from "@/components/Buttons/EditButtonLink";
import { DeleteButtonLink } from "@/components/Buttons/DeleteButtonLink";
import { ButtonGroupWithDropdown } from "@/components/Buttons/ButtonGroupWithDropdown";
import { ConfirmationDialogController } from "@/components/ConfirmationDialog/controller";
import ForbiddenPage from "pages/Misc/403";
import { usePermissions } from "./permissions"; // sesuaikan path
import { ApproveButtonLink } from "@/components/Buttons/ApproveButtonLink";
import { ReceiveButtonLink } from "@/components/Buttons/ReceiveButtonLink";
import { ViewButtonLink } from "@/components/Buttons/ViewButtonLink";
import {
  PurchaseOrderDetailPane,
  PurchaseOrderDetailPaneController,
} from "./PurchaseOrderDetailPane";
import { CancelButtonLink } from "@/components/Buttons/CancelButtonLink";

type PurchaseOrder = {
  id: string;
  order_number: string;
  supplier_id: string;
  supplier_name: string | null;
  order_date: string;
  expected_date: string | null;
  status: "draft" | "confirmed" | "received" | "cancelled";
  notes?: string | null;
};

export default function PurchaseOrderListPage() {
  const {
    canView,
    canDelete,
    canUpdate,
    canCreate,
    canApprove,
    canReceive,
    canCancel,
  } = usePermissions();

  if (!canView) return <ForbiddenPage />;

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchPurchaseOrders = async () => {
    setLoading(true);
    try {
      const data = await getPurchaseOrders();
      setPurchaseOrders(data);
    } catch (err: any) {
      setError(err.message || "Gagal memuat data purchase order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchaseOrders();
  }, []);

  const data = useMemo(() => purchaseOrders, [purchaseOrders]);

  const handleEdit = (po: PurchaseOrder) => {
    if (!canUpdate) {
      showErrorToast("Anda tidak punya hak akses untuk fitur ini!");
      return;
    }

    openTabSmart(
      {
        id: `/purchase-order/${po.id}/edit`,
        route: `/purchase-order/${po.id}/edit`,
        label: `Edit PO: ${po.order_number}`,
        type: "route",
        icon: "RiPencilFill",
      },
      { replace: true }
    );
  };

  const handleReceive = (po: PurchaseOrder) => {
    if (!canReceive) {
      showErrorToast("Anda tidak punya hak akses untuk fitur ini!");
      return;
    }

    openTabSmart(
      {
        id: `/purchase-order/${po.id}/receive`,
        route: `/purchase-order/${po.id}/receive`,
        label: `receive PO: ${po.order_number}`,
        type: "route",
        icon: "RiShoppingBasketFill",
      },
      { replace: false }
    );
  };

  const handleApprove = async (id: string) => {
    if (!canApprove) {
      showErrorToast("Anda tidak punya hak akses untuk fitur ini!");
      return;
    }

    ConfirmationDialogController.askConfirmation(
      "Yakin ingin setujui PO ini?",
      async () => {
        try {
          await approvePurchaseOrder(id);
          showSuccessToast("Purchase Order berhasil disetujui");
          fetchPurchaseOrders();
        } catch (err: any) {
          showErrorToast(err.message);
        }
      }
    );
  };

  const handleCancel = async (id: string) => {
    if (!canCancel) {
      showErrorToast("Anda tidak punya hak akses untuk fitur ini!");
      return;
    }

    ConfirmationDialogController.askConfirmation(
      "Yakin ingin membatalkan PO ini?",
      async () => {
        try {
          await cancelPurchaseOrder(id);
          showSuccessToast("Purchase Order berhasil dibatalkan");
          fetchPurchaseOrders();
        } catch (err: any) {
          showErrorToast(err.message);
        }
      }
    );
  };

  const handleView = async (id: string) => {
    try {
      const detail = await getPurchaseOrderDetail(id);
      PurchaseOrderDetailPaneController.open(detail);
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
      "Yakin ingin menghapus purchase order ini?",
      async () => {
        try {
          await deletePurchaseOrder(id);
          showSuccessToast("Purchase Order berhasil dihapus");
          fetchPurchaseOrders();
        } catch (err: any) {
          showErrorToast(err.message);
        }
      }
    );
  };

  const columns = useMemo<ColumnDef<PurchaseOrder>[]>(
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
        accessorKey: "order_number",
        header: "Nomor PO",
      },
      {
        accessorKey: "supplier_name",
        header: "Supplier",
        cell: ({ row }) => row.original.supplier_name || "-",
      },
      {
        accessorKey: "order_date",
        header: "Tanggal Order",
        cell: ({ row }) =>
          new Date(row.original.order_date).toLocaleDateString(),
      },
      {
        accessorKey: "expected_date",
        header: "Tanggal Estimasi",
        cell: ({ row }) =>
          row.original.expected_date
            ? new Date(row.original.expected_date).toLocaleDateString()
            : "-",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status;
          const color =
            status === "draft"
              ? "bg-gray-500"
              : status === "confirmed"
              ? "bg-blue-500"
              : status === "received"
              ? "bg-green-500"
              : "bg-red-500";
          return (
            <div className="flex gap-2">
              <span
                className={`px-2 py-1 rounded text-white text-xs font-semibold ${color}`}
              >
                {status}
              </span>
              {canApprove && status === "draft" && (
                <ApproveButtonLink
                  onClick={() => handleApprove(row.original.id)}
                  className={`flex cursor-pointer hover:bg-emerald-500 px-2 py-1 rounded text-white text-xs font-semibold ${color}`}
                />
              )}
            </div>
          );
        },
      },
      {
        id: "aksi",
        header: "Aksi",
        cell: ({ row }) => {
          const status = row.original.status;

          return (
            <div className="flex gap-1">
              {(status === "confirmed" ||
                status === "cancelled" ||
                status === "received") && (
                <ViewButtonLink onClick={() => handleView(row.original.id)} />
              )}
              {canReceive && status === "confirmed" && (
                <ReceiveButtonLink
                  onClick={() => handleReceive(row.original)}
                />
              )}

              {canUpdate &&
                status !== "confirmed" &&
                status !== "received" &&
                status !== "cancelled" && (
                  <EditButtonLink onClick={() => handleEdit(row.original)} />
                )}
              {canDelete &&
                status !== "confirmed" &&
                status !== "received" &&
                status !== "cancelled" && (
                  <DeleteButtonLink
                    onClick={() => handleDelete(row.original.id)}
                  />
                )}
              {canCancel && status === "confirmed" && (
                <CancelButtonLink
                  onClick={() => handleCancel(row.original.id)}
                />
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
        id: "/purchase-order/create",
        route: "/purchase-order/create",
        label: "Tambah Purchase Order",
        type: "route",
        icon: "RiAddBoxLine",
      },
      { replace: !newTab, remember: true }
    );
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Daftar Purchase Order</h1>
        {canCreate && (
          <ButtonGroupWithDropdown
            mainLabel={
              <>
                <IconRenderer
                  name="RiAddBoxLine"
                  size={15}
                  className="text-white"
                />
                Tambah Purchase Order
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

      <PurchaseOrderDetailPane />
    </div>
  );
}
