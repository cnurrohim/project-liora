import { useEffect, useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { getGoodsReceipts, getGoodsReceiptDetail } from "./goodsReceipt.api";
import { openTabSmart } from "@/utils/handleMenuClick/openTabSmart";
import { IconRenderer } from "@/components/IconRenderer";
import { ViewButtonLink } from "@/components/Buttons/ViewButtonLink";
import { ButtonGroupWithDropdown } from "@/components/Buttons/ButtonGroupWithDropdown";
import ForbiddenPage from "pages/Misc/403";
import { usePermissions } from "./permissions";
import {
  GoodsReceiptDetailPane,
  GoodsReceiptDetailPaneController,
} from "./GoodsReceiptDetailPane";
import { DataTable } from "@/components/Table/DataTable";

type GoodsReceipt = {
  id: string;
  receipt_number: string;
  supplier_name: string | null;
  receipt_date: string;
  notes?: string | null;
};

export default function GoodsReceiptListPage() {
  const { canView, canCreate } = usePermissions();

  if (!canView) return <ForbiddenPage />;

  const [goodsReceipts, setGoodsReceipts] = useState<GoodsReceipt[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => setSearch(searchInput), 500);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const fetchGoodsReceipts = async () => {
    setLoading(true);
    try {
      const data = await getGoodsReceipts(search);
      setGoodsReceipts(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch Goods Receipt data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoodsReceipts();
  }, [search]);

  const data = useMemo(() => goodsReceipts, [goodsReceipts]);

  const handleView = async (id: string) => {
    try {
      const detail = await getGoodsReceiptDetail(id);
      GoodsReceiptDetailPaneController.open(detail);
    } catch (err) {
      console.error("Failed to fetch data", err);
    }
  };

  const columns = useMemo<ColumnDef<GoodsReceipt>[]>(
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
        accessorKey: "receipt_number",
        header: "GR Number",
      },
      {
        accessorKey: "supplier_name",
        header: "Supplier",
        cell: ({ row }) => row.original.supplier_name || "-",
      },
      {
        accessorKey: "receipt_date",
        header: "Receipt Date",
        cell: ({ row }) =>
          new Date(row.original.receipt_date).toLocaleDateString(),
      },
      {
        accessorKey: "notes",
        header: "Note",
        cell: ({ row }) => row.original.notes || "-",
      },
      {
        id: "aksi",
        header: "Action",
        cell: ({ row }) => (
          <div className="flex gap-1">
            <ViewButtonLink onClick={() => handleView(row.original.id)} />
            {/* {canUpdate && (
              <EditButtonLink onClick={() => handleEdit(row.original)} />
            )}
            {canDelete && (
              <DeleteButtonLink onClick={() => handleDelete(row.original.id)} />
            )} */}
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
        id: "/goods-receipts/create",
        route: "/goods-receipts/create",
        label: "Create Goods Receipt",
        type: "route",
        icon: "RiAddBoxLine",
      },
      { replace: !newTab, remember: true }
    );
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Goods Receipts</h1>
      </div>

      {/* 🔹 filter section */}
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search PO Number"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="border border-[var(--content-border)] bg-[var(--content-surface-hover)] p-1 rounded w-90"
        />

        {canCreate && (
          <ButtonGroupWithDropdown
            mainLabel={
              <>
                <IconRenderer name="RiAddBoxLine" size={15} />
                Create Goods Receipt
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
      <GoodsReceiptDetailPane />
    </div>
  );
}
