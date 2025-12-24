import { useEffect, useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
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
import { DataTable } from "@/components/Table/DataTable";

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

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => setSearch(searchInput), 500);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const fetchPurchaseOrders = async () => {
    setLoading(true);
    try {
      const data = await getPurchaseOrders(search);
      setPurchaseOrders(data);
    } catch (err: any) {
      setError(err.message || "Failed to load purchase order data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchaseOrders();
  }, [search]);

  const data = useMemo(() => purchaseOrders, [purchaseOrders]);

  const handleEdit = (po: PurchaseOrder) => {
    if (!canUpdate) {
      showErrorToast("We're sorry, you don't have access for this feature!");
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
      showErrorToast("We're sorry, you don't have access for this feature!");
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
      showErrorToast("We're sorry, you don't have access for this feature!");
      return;
    }

    ConfirmationDialogController.askConfirmation(
      "You're about to approve this PO, proceed?",
      async () => {
        try {
          await approvePurchaseOrder(id);
          showSuccessToast("Purchase Order Approved");
          fetchPurchaseOrders();
        } catch (err: any) {
          showErrorToast(err.message);
        }
      }
    );
  };

  const handleCancel = async (id: string) => {
    if (!canCancel) {
      showErrorToast("We're sorry, you don't have access for this feature!");
      return;
    }

    ConfirmationDialogController.askConfirmation(
      "You're about to cancel this PO, proceed?",
      async () => {
        try {
          await cancelPurchaseOrder(id);
          showSuccessToast("Purchase Order Canceled");
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
      console.error("Failed to fetch data", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!canDelete) {
      showErrorToast("We're sorry, you don't have access for this feature!");
      return;
    }

    ConfirmationDialogController.askConfirmation(
      "You're about to delete this PO, proceed?",
      async () => {
        try {
          await deletePurchaseOrder(id);
          showSuccessToast("Purchase Order Deleted");
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
          return <div>{row.index + 1}</div>;
        },
        size: 50,
      },
      {
        accessorKey: "order_number",
        header: "PO Number",
      },
      {
        accessorKey: "supplier_name",
        header: "Supplier",
        cell: ({ row }) => row.original.supplier_name || "-",
      },
      {
        accessorKey: "order_date",
        header: "Order Date",
        cell: ({ row }) =>
          new Date(row.original.order_date).toLocaleDateString(),
      },
      {
        accessorKey: "expected_date",
        header: "Estimation Date",
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
              ? "bg-(--warning) text-(--warning-foreground)"
              : status === "confirmed"
              ? "bg-(--success) text-(--success-foreground)"
              : status === "received"
              ? "bg-(--info) text-(--info-foreground)"
              : "bg-(--mute) text-(--mute-foreground)";
          return (
            <div className="flex gap-2">
              <span
                className={`px-2 py-1 w-20 text-center rounded  text-xs font-semibold ${color}`}
              >
                {status}
              </span>
              {canApprove && status === "draft" && (
                <ApproveButtonLink
                  onClick={() => handleApprove(row.original.id)}
                />
              )}
            </div>
          );
        },
      },
      {
        id: "aksi",
        header: "Action",
        cell: ({ row }) => {
          const status = row.original.status;

          return (
            <div className="flex">
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
              <div className="flex gap-1">
                <ViewButtonLink onClick={() => handleView(row.original.id)} />
              </div>
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
        label: "Add New Purchase Order",
        type: "route",
        icon: "RiAddBoxLine",
      },
      { replace: !newTab, remember: true }
    );
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Purchase Order List</h1>
      </div>

      {/* 🔹 filter section */}
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search PO Number"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="border border-(--content-border) bg-(--content-surface-hover) p-1 rounded w-90"
        />

        {canCreate && (
          <ButtonGroupWithDropdown
            mainLabel={
              <>
                <IconRenderer name="RiAddBoxLine" size={15} />
                Add New Purchase Order
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

      {error && <div className="text-(--danger) mb-2">{error}</div>}
      {loading ? (
        <div>Fetching...</div>
      ) : (
        <>
          <DataTable table={table} />
        </>
      )}

      <PurchaseOrderDetailPane />
    </div>
  );
}
