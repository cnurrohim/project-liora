// src/pages/Inventory/StockAdjustmentListPage.tsx
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
import { DataTable } from "@/components/Table/DataTable";

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
      setError(err.message || "Failed to fetch Inventory Adjustment");
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
      console.error("Failed to fetch detail Adjustment", err);
    }
  };

  const handleConfirm = async (id: string) => {
    if (!canApprove) {
      showErrorToast("We're sorry, you don't have access for this feature!");
      return;
    }

    ConfirmationDialogController.askConfirmation(
      "You're about to approve this adjustment, proceed?",
      async () => {
        try {
          await confirmStockAdjustment(id);
          showSuccessToast("Inventory adjustment approved");
          fetchAdjustments();
        } catch (err: any) {
          showErrorToast(err.message);
        }
      }
    );
  };

  const handleCancel = async (id: string) => {
    if (!canApprove) {
      showErrorToast("We're sorry, you don't have access for this feature!");
      return;
    }

    ConfirmationDialogController.askConfirmation(
      "You're about to cancel this adjustment, proceed?",
      async () => {
        try {
          await cancelStockAdjustment(id);
          showSuccessToast("Inventory adjustment canceled");
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
        header: "Adjustment Number",
      },
      {
        accessorKey: "adjustment_date",
        header: "Date",
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
                  ? "bg-[var(--info)] text-[var(--info-foreground)]"
                  : "bg-[var(--warning)] text-[var(--warning-foreground)]"
              }`}
            >
              {row.original.status}
            </span>

            {canApprove && row.original.status === "draft" && (
              <ApproveButtonLink
                onClick={() => handleConfirm(row.original.id)}
                className={`flex cursor-pointer hover:bg-[var(--info-hover)] px-2 py-1 rounded text-[var(--text-primary)] text-xs font-semibold bg-[var(--info)]`}
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
        header: "Action",
        cell: ({ row }) => (
          <div className="flex gap-1">
            <ViewButtonLink onClick={() => handleView(row.original.id)} />
            {canApprove && row.original.status === "draft" && (
              <CancelButtonLink
                onClick={() => handleCancel(row.original.id)}
                className={`flex gap-1 cursor-pointer hover:bg-amber-500 px-2 py-1 rounded text-[var(--text-primary)] text-xs font-semibold bg-amber-600`}
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
        <h1 className="text-xl font-bold">Inventory Adjustment List</h1>
        {canCreate && (
          <ButtonGroupWithDropdown
            mainLabel={
              <>
                <IconRenderer name="RiAddBoxLine" size={15} />
                Create Adjustment
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

      {error && <div className="text-[var(--danger)] mb-2">{error}</div>}
      {loading ? (
        <div>Fetching...</div>
      ) : (
        <>
          <DataTable table={table} />
        </>
      )}
      <StockAdjustmentDetailPane />
    </div>
  );
}
