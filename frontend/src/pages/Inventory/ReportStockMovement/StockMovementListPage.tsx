// src/pages/Inventory/StockMovementListPage.tsx
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
  getStockMovements,
  printStockMovementsPDF,
  printStockMovementsExcel,
} from "./reportStockMovement.api";
import { showErrorToast } from "@/utils/toast";

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
      setError(err.message || "Gagal memuat data Stock Movements");
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
      const blob = await printStockMovementsPDF({
        search,
        movement_type: movementType || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      });

      downloadBlob(blob, "stock-movement.pdf");
    } catch (err: any) {
      showErrorToast(err.message || "Gagal cetak PDF");
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
      showErrorToast(err.message || "Gagal cetak Excel");
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
        header: "Tanggal",
        cell: ({ row }) =>
          new Date(row.original.created_at).toLocaleString("id-ID"),
      },
      {
        accessorKey: "item_sku",
        header: "SKU",
      },
      {
        accessorKey: "item_name",
        header: "Nama Barang",
      },
      {
        accessorKey: "movement_type",
        header: "Tipe",
        cell: ({ row }) => (
          <span
            className={`px-2 py-0.5 rounded text-xs ${
              row.original.movement_type === "inbound"
                ? "bg-emerald-600 text-white"
                : row.original.movement_type === "outbound"
                ? "bg-red-600 text-white"
                : "bg-gray-600 text-white"
            }`}
          >
            {row.original.movement_type}
          </span>
        ),
      },
      {
        accessorKey: "adjustment_direction",
        header: "Arah",
      },
      {
        accessorKey: "qty",
        header: "Qty",
        cell: ({ row }) => (
          <span
            className={
              row.original.adjustment_direction === "increase"
                ? "text-green-500 font-semibold"
                : "text-red-500 font-semibold"
            }
          >
            {row.original.qty}
          </span>
        ),
      },
      {
        accessorKey: "balance_after",
        header: "Saldo Setelah",
      },
      {
        accessorKey: "source_location_name",
        header: "Lokasi Asal",
        cell: ({ row }) => row.original.source_location_name || "-",
      },
      {
        accessorKey: "target_location_name",
        header: "Lokasi Tujuan",
        cell: ({ row }) => row.original.target_location_name || "-",
      },
      {
        accessorKey: "reference_type",
        header: "Ref Type",
      },
      {
        accessorKey: "note",
        header: "Catatan",
        cell: ({ row }) => row.original.note || "-",
      },
      {
        accessorKey: "created_by",
        header: "Dibuat Oleh",
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
      <div className="flex flex-wrap gap-4 mb-4 text-sm">
        <input
          type="text"
          placeholder="Cari SKU / Nama barang..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="border p-2 rounded w-60"
        />
        <select
          value={movementType}
          onChange={(e) => setMovementType(e.target.value as MovementType)}
          className="border p-2 rounded"
        >
          <option value="">Semua Tipe</option>
          <option value="inbound">Inbound</option>
          <option value="outbound">Outbound</option>
          <option value="adjustment">Adjustment</option>
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
