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
  getStockHistoryReports,
  printStockHistoryReportsPDF,
  printStockHistoryReportsExcel,
} from "./stockHistoryReport.api";
import { showErrorToast } from "@/utils/toast";
import { IconRenderer } from "@/components/IconRenderer";
import { DataTable } from "@/components/Table/DataTable";
import { usePermissions } from "./permissions";
import ForbiddenPage from "@/pages/Misc/403";

type StockHistory = {
  item_code: string;
  item_name: string;
  period: string; // yyyy-mm-dd hasil DATE_TRUNC
  total_in: number;
  total_out: number;
  closing_balance: number;
};

export default function StockHistoryReportPage() {
  const { canView } = usePermissions();

  if (!canView) return <ForbiddenPage />;

  const [histories, setHistories] = useState<StockHistory[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔹 filter states
  const [period, setPeriod] = useState<"day" | "week" | "month">("month");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const fetchHistories = async () => {
    setLoading(true);
    try {
      const data = await getStockHistoryReports({
        period,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      });
      setHistories(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch Riwayat Masuk/Keluar");
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
      const blob = await printStockHistoryReportsPDF({
        period,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      });

      downloadBlob(blob, "stock-history.pdf");
    } catch (err: any) {
      showErrorToast(err.message || "Export to PDF failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadExcel = async () => {
    setLoading(true);
    try {
      const blob = await printStockHistoryReportsExcel({
        period,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      });

      downloadBlob(blob, "stock-history.xlsx");
    } catch (err: any) {
      showErrorToast(err.message || "Export to excel failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistories();
  }, [period, dateFrom, dateTo]);

  const columns = useMemo<ColumnDef<StockHistory>[]>(
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
        accessorKey: "period",
        header: "Period",
        cell: ({ row }) =>
          new Date(row.original.period).toLocaleDateString("id-ID"),
      },
      {
        accessorKey: "item_code",
        header: "SKU",
      },
      {
        accessorKey: "item_name",
        header: "Item Name",
      },
      {
        accessorKey: "total_in",
        header: "Total Inbound",
        cell: ({ row }) => (
          <span className="text-green-600 font-semibold">
            {row.original.total_in}
          </span>
        ),
      },
      {
        accessorKey: "total_out",
        header: "Total Outbond",
        cell: ({ row }) => (
          <span className="text-red-600 font-semibold">
            {row.original.total_out}
          </span>
        ),
      },
      {
        accessorKey: "closing_balance",
        header: "Closing Balance",
      },
    ],
    [histories]
  );

  const table = useReactTable({
    data: histories,
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
      <h1 className="text-xl font-bold mb-4">
        Inbound / Outbond Historical Report
      </h1>

      {/* 🔹 filter section */}
      <div className="flex flex-wrap gap-4 mb-4 text-sm">
        <select
          value={period}
          onChange={(e) =>
            setPeriod(e.target.value as "day" | "week" | "month")
          }
          className="border border-[var(--content-border)] bg-[var(--content-surface-hover)] p-1 rounded text-[var(--muted)]"
        >
          <option value="day">Daily</option>
          <option value="week">Weekly</option>
          <option value="month">Monthly</option>
        </select>

        <div className="flex items-center gap-2">
          <label>From:</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="border border-[var(--content-border)] bg-[var(--content-surface-hover)] p-1 rounded text-[var(--muted)]"
          />
        </div>
        <div className="flex items-center gap-2">
          <label>To:</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="border border-[var(--content-border)] bg-[var(--content-surface-hover)] p-1 rounded text-[var(--muted)]"
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
