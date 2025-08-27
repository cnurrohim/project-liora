// src/pages/Inventory/StockLocationReportPage.tsx
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
  getStockLocationReports,
  printStockLocationReportsPDF,
  printStockLocationReportsExcel,
} from "./stockLocationReport.api";
import { showErrorToast } from "@/utils/toast";
import { searchLocation } from "@/api/search.api";
import SearchSelect from "@/components/SelectOptions/searchSelect";

type StockLocationReport = {
  location_id: string;
  location: string;
  total_item_types: number;
  total_qty: number;
  last_update?: string | null;
};

export default function StockLocationReportPage() {
  const [data, setData] = useState<StockLocationReport[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔹 filter states
  const [locationId, setLocationId] = useState<string | undefined>("");
  const [locationName, setLocationName] = useState<string | undefined>("");
  const [selectedLocation, setSelectedLocation] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await getStockLocationReports({
        location_id: locationId || undefined,
      });
      setData(result);
    } catch (err: any) {
      setError(err.message || "Gagal memuat data Stock per Location");
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
      const blob = await printStockLocationReportsPDF({
        location_id: locationId || undefined,
        location_name: locationName || undefined,
      });
      downloadBlob(blob, "stock-location-report.pdf");
    } catch (err: any) {
      showErrorToast(err.message || "Gagal cetak PDF");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadExcel = async () => {
    setLoading(true);
    try {
      const blob = await printStockLocationReportsExcel({
        location_id: locationId || undefined,
        location_name: locationName || undefined,
      });
      downloadBlob(blob, "stock-location-report.xlsx");
    } catch (err: any) {
      showErrorToast(err.message || "Gagal cetak Excel");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [locationId]);

  const handleSearchLocation = async (keyword: string) => {
    if (!keyword || keyword.length < 2) return [];
    try {
      const results = await searchLocation(keyword);
      return results.map((location: any) => ({
        id: location.id,
        name: `${location.code}-${location.name}`,
      }));
    } catch (err) {
      console.error(err);
      showErrorToast("Gagal mencari lokasi");
      return [];
    }
  };

  const columns = useMemo<ColumnDef<StockLocationReport>[]>(
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
      { accessorKey: "location", header: "Lokasi" },
      {
        accessorKey: "total_item_types",
        header: "Jumlah Jenis Barang",
        cell: ({ row }) => (
          <span className="font-semibold">{row.original.total_item_types}</span>
        ),
      },
      {
        accessorKey: "total_qty",
        header: "Total Qty",
        cell: ({ row }) => (
          <span className="font-semibold">{row.original.total_qty}</span>
        ),
      },
      {
        accessorKey: "last_update",
        header: "Terakhir Update",
        cell: ({ row }) =>
          row.original.last_update
            ? new Date(row.original.last_update).toLocaleString("id-ID")
            : "-",
      },
    ],
    [data]
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    initialState: { pagination: { pageIndex: 0, pageSize: 15 } },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Stock per Location</h1>

      {/* 🔹 filter section */}
      <div className="flex flex-wrap gap-4 mb-4 text-sm">
        <div className="w-58">
          <SearchSelect
            value={selectedLocation}
            placeholder="Cari Lokasi"
            onChange={(val) => {
              setSelectedLocation(val);
              setLocationId(val?.id);
              setLocationName(val?.name);
            }}
            fetchOptions={handleSearchLocation}
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
