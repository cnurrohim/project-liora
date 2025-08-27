// src/pages/Inventory/StockHistoryReportPage.tsx
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
  getStockHistoryReports,
  printStockHistoryReportsPDF,
  printStockHistoryReportsExcel,
} from "./stockHistoryReport.api";
import { showErrorToast } from "@/utils/toast";

type StockHistory = {
  item_code: string;
  item_name: string;
  period: string; // yyyy-mm-dd hasil DATE_TRUNC
  total_in: number;
  total_out: number;
  closing_balance: number;
};

export default function StockHistoryReportPage() {
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
      setError(err.message || "Gagal memuat data Riwayat Masuk/Keluar");
      showErrorToast(err.message || "Gagal memuat data");
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
      showErrorToast(err.message || "Gagal cetak PDF");
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
      showErrorToast(err.message || "Gagal cetak Excel");
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
          const { pageIndex, pageSize } = table.getState().pagination;
          return <div>{pageIndex * pageSize + row.index + 1}</div>;
        },
        size: 40,
      },
      {
        accessorKey: "period",
        header: "Periode",
        cell: ({ row }) =>
          new Date(row.original.period).toLocaleDateString("id-ID"),
      },
      {
        accessorKey: "item_code",
        header: "SKU",
      },
      {
        accessorKey: "item_name",
        header: "Nama Barang",
      },
      {
        accessorKey: "total_in",
        header: "Masuk",
        cell: ({ row }) => (
          <span className="text-green-600 font-semibold">
            {row.original.total_in}
          </span>
        ),
      },
      {
        accessorKey: "total_out",
        header: "Keluar",
        cell: ({ row }) => (
          <span className="text-red-600 font-semibold">
            {row.original.total_out}
          </span>
        ),
      },
      {
        accessorKey: "closing_balance",
        header: "Saldo Akhir",
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
      <h1 className="text-xl font-bold mb-4">Report Riwayat Masuk / Keluar</h1>

      {/* 🔹 filter section */}
      <div className="flex flex-wrap gap-4 mb-4 text-sm">
        <select
          value={period}
          onChange={(e) =>
            setPeriod(e.target.value as "day" | "week" | "month")
          }
          className="border p-2 rounded"
        >
          <option value="day">Harian</option>
          <option value="week">Mingguan</option>
          <option value="month">Bulanan</option>
        </select>

        <div className="flex items-center gap-2">
          <label>Dari:</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="border p-1 rounded"
          />
        </div>
        <div className="flex items-center gap-2">
          <label>Sampai:</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="border p-1 rounded"
          />
        </div>

        <button
          onClick={handleDownloadPDF}
          className="px-3 py-1 bg-blue-600 cursor-pointer text-white rounded"
          disabled={loading}
        >
          {loading ? "Loading ..." : "Download PDF"}
        </button>

        <button
          onClick={handleDownloadExcel}
          className="px-3 py-1 bg-blue-600 cursor-pointer text-white rounded"
          disabled={loading}
        >
          {loading ? "Loading ..." : "Download Excel"}
        </button>
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
    </div>
  );
}
