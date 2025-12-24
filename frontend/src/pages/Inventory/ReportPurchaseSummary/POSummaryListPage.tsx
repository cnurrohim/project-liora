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
import { usePermissions } from "./permissions";
import ForbiddenPage from "@/pages/Misc/403";

type POSummary = {
  po_no: string;
  supplier: string;
  order_date: string;
  expected_date: string;
  total_items: number;
  received_percent: number;
  status: "Open" | "Partial" | "Received" | "Cancelled";
};

export default function POSummaryListPage() {
  const { canView } = usePermissions();

  if (!canView) return <ForbiddenPage />;

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
          return <div>{row.index + 1}</div>;
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
          <div className="w-32 bg-(--content-surface-hover) rounded-full h-3 overflow-hidden">
            <div
              className={`h-3 ${
                row.original.status === "Cancelled"
                  ? "bg-(--mute)"
                  : row.original.received_percent >= 100
                  ? "bg-(--info)"
                  : row.original.received_percent > 0
                  ? "bg-(--success)"
                  : "bg-(--warning)"
              }`}
              style={{
                width: `${row.original.received_percent}%`,
              }}
            />
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <div
            className={`px-2 py-0.5 rounded text-xs font-medium w-full text-center ${
              row.original.status === "Open"
                ? "bg-(--warning) text-(--warning-foreground)"
                : row.original.status === "Partial"
                ? "bg-(--success) text-(--success-foreground)"
                : row.original.status === "Cancelled"
                ? "bg-(--mute) text-(--mute-foreground)"
                : "bg-(--info) text-(--info-foreground)"
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
            className="border border-(--content-border) bg-(--content-surface-hover) p-1 rounded text-(--muted)"
          />
        </div>
        <div className="flex items-center gap-2">
          <label>To:</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="border border-(--content-border) bg-(--content-surface-hover) p-1 rounded text-(--muted)"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-(--content-border) bg-(--content-surface-hover) p-1 rounded text-(--muted)"
        >
          <option value="">All Status</option>
          <option value="Open">Open</option>
          <option value="Partial">Partial</option>
          <option value="Received">Received</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        <button
          onClick={handleDownloadPDF}
          className="px-3 py-1 bg-(--warning) hover:bg-(--warning-hover) cursor-pointer text-(--warning-foreground) rounded flex flex-row gap-2 items-center"
          disabled={loading}
        >
          <IconRenderer name="RiFilePdf2Line" size={20} />{" "}
          {loading ? "Loading ..." : "Export to PDF"}
        </button>

        <button
          onClick={handleDownloadExcel}
          className="px-3 py-1 bg-(--success) hover:bg-(--success-hover) cursor-pointer text-(--success-foreground) rounded flex flex-row gap-2 items-center"
          disabled={loading}
        >
          <IconRenderer name="RiFileExcel2Line" size={20} />{" "}
          {loading ? "Loading ..." : "Export to Excel"}
        </button>
      </div>

      {error && <div className="text-(--danger) mb-2">{error}</div>}
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
