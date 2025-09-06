// src/pages/Inventory/StockMovementListPage.tsx
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
  getStockMovements,
  printStockMovementsPDF,
  printStockMovementsExcel,
} from "./reportStockMovement.api";
import { showErrorToast } from "@/utils/toast";
import { DataTable } from "@/components/Table/DataTable";
import { IconRenderer } from "@/components/IconRenderer";

type StockMovement = {
  id: string;
  item_sku: string;
  item_name: string;
  movement_type: string;
  adjustment_direction: string;
  qty: number;
  balance_after: number;
  reference_type: string;
  note?: string | null;
  created_at: string;
  created_by?: string | null;
  source_location_name?: string | null;
  target_location_name?: string | null;
};

type MovementType = "inbound" | "outbound" | "adjustment";

export default function StockMovementListPage() {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔹 filter states
  const [search, setSearch] = useState("");
  const [movementType, setMovementType] = useState<MovementType | undefined>();
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => setSearch(searchInput), 500);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const fetchMovements = async () => {
    setLoading(true);
    try {
      const data = await getStockMovements({
        search,
        movement_type: movementType || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      });
      setMovements(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch Stock Movements");
      showErrorToast(err.message || "Failed to fetch");
    } finally {
      setLoading(false);
    }
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = async () => {
    setLoading(true);
    try {
      const blob = await printStockMovementsPDF({
        search,
        movement_type: movementType || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      });

      downloadBlob(blob, "stock-movement.pdf");
    } catch (err: any) {
      showErrorToast(err.message || "Export to PDF failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadExcel = async () => {
    setLoading(true);
    try {
      const blob = await printStockMovementsExcel({
        search,
        movement_type: movementType || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      });

      downloadBlob(blob, "stock-movement.xlsx");
    } catch (err: any) {
      showErrorToast(err.message || "Export to excel failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, [search, movementType, dateFrom, dateTo]);

  const columns = useMemo<ColumnDef<StockMovement>[]>(
    () => [
      {
        id: "number",
        header: "#",
        cell: ({ row }) => {
          const { pageIndex, pageSize } = table.getState().pagination;
          return <div>{pageIndex * pageSize + row.index + 1}</div>;
        },
        size: 40,
      },
      {
        accessorKey: "created_at",
        header: "Movement Date",
        cell: ({ row }) =>
          new Date(row.original.created_at).toLocaleString("id-ID"),
      },
      {
        accessorKey: "item_sku",
        header: "SKU",
      },
      {
        accessorKey: "item_name",
        header: "Item",
      },
      {
        accessorKey: "movement_type",
        header: "Type",
        cell: ({ row }) => (
          <span
            className={`px-2 py-0.5 rounded text-xs ${
              row.original.movement_type === "inbound"
                ? "bg-[var(--success)] text-[var(--success-foreground)]"
                : row.original.movement_type === "outbound"
                ? "bg-[var(--warning)] text-[var(--warning-foreground)]"
                : "bg-[var(--inset)] text-[var(--text-primary)]"
            }`}
          >
            {row.original.movement_type}
          </span>
        ),
      },
      {
        accessorKey: "adjustment_direction",
        header: "Direction",
      },
      {
        accessorKey: "qty",
        header: "Qty",
        cell: ({ row }) => (
          <span
            className={
              row.original.adjustment_direction === "increase"
                ? "text-[var(--success)] font-semibold"
                : "text-[var(--danger)] font-semibold"
            }
          >
            {row.original.qty}
          </span>
        ),
      },
      {
        accessorKey: "balance_after",
        header: "Balance After",
      },
      {
        accessorKey: "source_location_name",
        header: "Transfered From",
        cell: ({ row }) => row.original.source_location_name || "-",
      },
      {
        accessorKey: "target_location_name",
        header: "Transfered To",
        cell: ({ row }) => row.original.target_location_name || "-",
      },
      {
        accessorKey: "reference_type",
        header: "Ref. Type",
      },
      {
        accessorKey: "note",
        header: "Note",
        cell: ({ row }) => row.original.note || "-",
      },
      {
        accessorKey: "created_by",
        header: "Created By",
        cell: ({ row }) => row.original.created_by || "-",
      },
    ],
    [movements]
  );

  const table = useReactTable({
    data: movements,
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

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Stock Movement Ledger</h1>

      {/* 🔹 filter section */}
      <div className="flex flex-wrap gap-4 mb-10 text-sm">
        <input
          type="text"
          placeholder="Enter SKU / Item Name..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="border border-[var(--border)] p-1 rounded w-60"
        />
        <select
          value={movementType}
          onChange={(e) => setMovementType(e.target.value as MovementType)}
          className="border border-[var(--border)] p-1 rounded text-[var(--muted)]"
        >
          <option value="">All Type</option>
          <option value="inbound">Inbound</option>
          <option value="outbound">Outbound</option>
          <option value="adjustment">Adjustment</option>
        </select>
        <div className="flex items-center gap-2">
          <label>From:</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="border border-[var(--border)] p-1 rounded text-[var(--muted)]"
          />
        </div>
        <div className="flex items-center gap-2">
          <label>To:</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="border border-[var(--border)] p-1 rounded text-[var(--muted)]"
          />
        </div>
        <button
          onClick={handleDownloadPDF}
          className="px-3 py-1 bg-[var(--warning)] hover:bg-[var(--warning-hover)] cursor-pointer text-[var(--warning-foreground)] rounded flex flex-row gap-2 items-center"
          disabled={loading}
        >
          <IconRenderer name="RiFilePdf2Line" size={20} />{" "}
          {loading ? "Loading ..." : "Export to PDF"}
        </button>

        <button
          onClick={handleDownloadExcel}
          className="px-3 py-1 bg-[var(--success)] hover:bg-[var(--success-hover)] cursor-pointer text-[var(--success-foreground)] rounded flex flex-row gap-2 items-center"
          disabled={loading}
        >
          <IconRenderer name="RiFileExcel2Line" size={20} />{" "}
          {loading ? "Loading ..." : "Export to Excel"}
        </button>
      </div>

      {error && <div className="text-[var(--danger)] mb-2">{error}</div>}
      {loading ? (
        <div>Fetching...</div>
      ) : (
        <>
          <DataTable table={table} />
        </>
      )}
    </div>
  );
}
