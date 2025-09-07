// src/pages/Inventory/POSummaryListPage.tsx
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
  getPOSummaryReports,
  printPOSummaryReportsPDF,
  printPOSummaryReportsExcel,
} from "./poSummary.api";
import { showErrorToast } from "@/utils/toast";
import { IconRenderer } from "@/components/IconRenderer";
import { DataTable } from "@/components/Table/DataTable";

type POSummary = {
  po_no: string;
  supplier: string;
  order_date: string;
  expected_date: string;
  total_items: number;
  received_percent: number;
  status: "Open" | "Partial" | "Received";
};

export default function POSummaryListPage() {
  const [poSummary, setPOSummary] = useState<POSummary[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔹 filter states
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [status, setStatus] = useState("");

  const fetchPOSummary = async () => {
    setLoading(true);
    try {
      const data = await getPOSummaryReports({
        from: from || undefined,
        to: to || undefined,
        status: status || undefined,
      });
      setPOSummary(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch PO Summary");
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
      const blob = await printPOSummaryReportsPDF({
        from: from || undefined,
        to: to || undefined,
        status: status || undefined,
      });
      downloadBlob(blob, "po-summary.pdf");
    } catch (err: any) {
      showErrorToast(err.message || "Export to PDF failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadExcel = async () => {
    setLoading(true);
    try {
      const blob = await printPOSummaryReportsExcel({
        from: from || undefined,
        to: to || undefined,
        status: status || undefined,
      });
      downloadBlob(blob, "po-summary.xlsx");
    } catch (err: any) {
      showErrorToast(err.message || "Export to excel failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPOSummary();
  }, [from, to, status]);

  const columns = useMemo<ColumnDef<POSummary>[]>(
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
        accessorKey: "po_no",
        header: "PO Numer",
      },
      {
        accessorKey: "supplier",
        header: "Supplier",
      },
      {
        accessorKey: "order_date",
        header: "Order Date",
        cell: ({ row }) =>
          new Date(row.original.order_date).toLocaleDateString("id-ID"),
      },
      {
        accessorKey: "expected_date",
        header: "Estimation Date",
        cell: ({ row }) =>
          new Date(row.original.expected_date).toLocaleDateString("id-ID"),
      },
      {
        accessorKey: "total_items",
        header: "Item Total",
      },
      {
        accessorKey: "received_percent",
        header: "Progress",
        cell: ({ row }) => (
          <div className="w-32 bg-[var(--content-surface-hover)] rounded-full h-3 overflow-hidden">
            <div
              className={`h-3 ${
                row.original.received_percent >= 100
                  ? "bg-[var(--success)]"
                  : row.original.received_percent > 0
                  ? "bg-[var(--warning)]"
                  : "bg-[var(--danger)]"
              }`}
              style={{ width: `${row.original.received_percent}%` }}
            />
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <div
            className={`px-2 py-0.5 rounded text-xs w-full text-center ${
              row.original.status === "Open"
                ? "bg-[var(--danger)] text-[var(--danger-foreground)]"
                : row.original.status === "Partial"
                ? "bg-[var(--warning)] text-[var(--warning-foreground)]"
                : "bg-[var(--success)] text-[var(--success-foreground)]"
            }`}
          >
            {row.original.status}
          </div>
        ),
      },
    ],
    [poSummary]
  );

  const table = useReactTable({
    data: poSummary,
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
      <h1 className="text-xl font-bold mb-4">Purchase Order Summary</h1>

      {/* 🔹 filter section */}
      <div className="flex flex-wrap gap-4 mb-4 text-sm">
        <div className="flex items-center gap-2">
          <label>From:</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="border border-[var(--content-border)] bg-[var(--content-surface-hover)] p-1 rounded text-[var(--muted)]"
          />
        </div>
        <div className="flex items-center gap-2">
          <label>To:</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="border border-[var(--content-border)] bg-[var(--content-surface-hover)] p-1 rounded text-[var(--muted)]"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-[var(--content-border)] bg-[var(--content-surface-hover)] p-1 rounded text-[var(--muted)]"
        >
          <option value="">All Status</option>
          <option value="Open">Open</option>
          <option value="Partial">Partial</option>
          <option value="Received">Received</option>
        </select>

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
