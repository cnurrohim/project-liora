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
import { DataTable } from "@/components/Table/DataTable";

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
      setError(err.message || "Failed to fetch Inventory Opname");
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
      console.error("Failed to fetch Inventory Opname Details", err);
    }
  };

  const handleConfirm = async (id: string) => {
    if (!canApprove) {
      showErrorToast("We're sorry, you don't have access for this feature!");
      return;
    }
    ConfirmationDialogController.askConfirmation(
      "Are you sure you want to finalize this adjustment take, the inventory quantity will change according to the results of the adjustment take?",
      async () => {
        try {
          await finalizeStockOpname(id);
          showSuccessToast("adjustment take finalized");
          fetchOpnames();
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
      "Are you sure you want to cancel this adjustment take?",
      async () => {
        try {
          await cancelStockOpname(id);
          showSuccessToast("Inventory opname successfully cancelled");
          fetchOpnames();
        } catch (err: any) {
          showErrorToast(err.message);
        }
      }
    );
  };

  const handleEdit = async (so: StockOpname) => {
    if (!canUpdate) {
      showErrorToast("We're sorry, you don't have access for this feature!");
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
      showErrorToast("We're sorry, you don't have access for this feature!");
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
          return <div>{row.index + 1}</div>;
        },
        size: 50,
      },
      {
        accessorKey: "opname_number",
        header: "Opname Number",
      },
      {
        accessorKey: "opname_date",
        header: "Date",
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
                row.original.status === "confirmed" ||
                row.original.status === "finalized"
                  ? "bg-[var(--info)] text-[var(--info-foreground)]"
                  : "bg-[var(--warning)] text-[var(--warning-foreground)]"
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
        header: "Action",
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
        <h1 className="text-xl font-bold">Inventory Opname List</h1>
        {canCreate && (
          <ButtonGroupWithDropdown
            mainLabel={
              <>
                <IconRenderer name="RiAddBoxLine" size={15} />
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

      {error && <div className="text-[var(--danger)] mb-2">{error}</div>}
      {loading ? (
        <div>Fetching...</div>
      ) : (
        <>
          <DataTable table={table} />
        </>
      )}
      <StockOpnameDetailPane />
    </div>
  );
}
