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
  getStockLocationReports,
  printStockLocationReportsPDF,
  printStockLocationReportsExcel,
} from "./stockLocationReport.api";
import { showErrorToast } from "@/utils/toast";
import { searchLocation } from "@/api/search.api";
import SearchSelect from "@/components/SelectOptions/searchSelect";
import { IconRenderer } from "@/components/IconRenderer";
import { DataTable } from "@/components/Table/DataTable";
import { usePermissions } from "./permissions";
import ForbiddenPage from "@/pages/Misc/403";

type StockLocationReport = {
  location_id: string;
  location: string;
  total_item_types: number;
  total_qty: number;
  last_update?: string | null;
};

export default function StockLocationReportPage() {
  const { canView } = usePermissions();

  if (!canView) return <ForbiddenPage />;

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
      setError(err.message || "Failed to fetch inventory per Location");
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
      const blob = await printStockLocationReportsPDF({
        location_id: locationId || undefined,
        location_name: locationName || undefined,
      });
      downloadBlob(blob, "inventory-location-report.pdf");
    } catch (err: any) {
      showErrorToast(err.message || "Export to PDF failed");
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
      downloadBlob(blob, "inventory-location-report.xlsx");
    } catch (err: any) {
      showErrorToast(err.message || "Export to excel failed");
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
      showErrorToast("Failed to fetch inventory location");
      return [];
    }
  };

  const columns = useMemo<ColumnDef<StockLocationReport>[]>(
    () => [
      {
        id: "number",
        header: "#",
        cell: ({ row }) => {
          return <div>{row.index + 1}</div>;
        },
        size: 40,
      },
      { accessorKey: "location", header: "Stored Location" },
      {
        accessorKey: "total_item_types",
        header: "Total Item Type",
        cell: ({ row }) => (
          <span className="font-semibold">{row.original.total_item_types}</span>
        ),
      },
      {
        accessorKey: "total_qty",
        header: "QTY Total",
        cell: ({ row }) => (
          <span className="font-semibold">{row.original.total_qty}</span>
        ),
      },
      {
        accessorKey: "last_update",
        header: "Last Updated",
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
      <h1 className="text-xl font-bold mb-4">Inventory per Location</h1>

      {/* 🔹 filter section */}
      <div className="flex flex-wrap gap-4 mb-4 text-sm">
        <div className="w-58">
          <SearchSelect
            value={selectedLocation}
            placeholder="Stored Location"
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
          className="px-3 py-1 bg-[var(--warning)] font-bold hover:bg-[var(--warning-hover)] cursor-pointer text-[var(--warning-foreground)] rounded flex flex-row gap-2 items-center"
          disabled={loading}
        >
          <IconRenderer name="RiFilePdf2Line" size={20} />{" "}
          {loading ? "Loading ..." : "Export to PDF"}
        </button>

        <button
          onClick={handleDownloadExcel}
          className="px-3 py-1 bg-[var(--success)] font-bold hover:bg-[var(--success-hover)] cursor-pointer text-[var(--success-foreground)] rounded flex flex-row gap-2 items-center"
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
