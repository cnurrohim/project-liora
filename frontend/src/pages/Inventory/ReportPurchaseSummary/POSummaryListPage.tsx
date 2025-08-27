// src/pages/Inventory/POSummaryListPage.tsx
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
  getPOSummaryReports,
  printPOSummaryReportsPDF,
  printPOSummaryReportsExcel,
} from "./poSummary.api";
import { showErrorToast } from "@/utils/toast";

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
      setError(err.message || "Gagal memuat data PO Summary");
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
      const blob = await printPOSummaryReportsPDF({
        from: from || undefined,
        to: to || undefined,
        status: status || undefined,
      });
      downloadBlob(blob, "po-summary.pdf");
    } catch (err: any) {
      showErrorToast(err.message || "Gagal cetak PDF");
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
      showErrorToast(err.message || "Gagal cetak Excel");
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
        header: "PO No",
      },
      {
        accessorKey: "supplier",
        header: "Supplier",
      },
      {
        accessorKey: "order_date",
        header: "Tanggal Order",
        cell: ({ row }) =>
          new Date(row.original.order_date).toLocaleDateString("id-ID"),
      },
      {
        accessorKey: "expected_date",
        header: "Tanggal Estimasi",
        cell: ({ row }) =>
          new Date(row.original.expected_date).toLocaleDateString("id-ID"),
      },
      {
        accessorKey: "total_items",
        header: "Total Item",
      },
      {
        accessorKey: "received_percent",
        header: "Progress",
        cell: ({ row }) => (
          <div className="w-32 bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-3 ${
                row.original.received_percent >= 100
                  ? "bg-green-600"
                  : row.original.received_percent > 0
                  ? "bg-yellow-500"
                  : "bg-red-500"
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
          <span
            className={`px-2 py-0.5 rounded text-xs ${
              row.original.status === "Open"
                ? "bg-red-600 text-white"
                : row.original.status === "Partial"
                ? "bg-yellow-500 text-black"
                : "bg-green-600 text-white"
            }`}
          >
            {row.original.status}
          </span>
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
          <label>Dari:</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="border p-1 rounded"
          />
        </div>
        <div className="flex items-center gap-2">
          <label>Sampai:</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="border p-1 rounded"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Semua Status</option>
          <option value="Open">Open</option>
          <option value="Partial">Partial</option>
          <option value="Received">Received</option>
        </select>

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
