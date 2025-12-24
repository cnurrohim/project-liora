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
  getStockOnHands,
  printStockOnHandsPDF,
  printStockOnHandsExcel,
} from "./reportStockOnHand.api";
import { showErrorToast } from "@/utils/toast";
import SearchSelect from "@/components/SelectOptions/searchSelect";
import { searchLocation } from "@/api/search.api";
import { IconRenderer } from "@/components/IconRenderer";
import { DataTable } from "@/components/Table/DataTable";
import { usePermissions } from "./permissions";
import ForbiddenPage from "@/pages/Misc/403";

type StockOnHand = {
  item_code: string;
  item_name: string;
  location: string;
  current_qty: number;
  last_movement?: string | null;
};

export default function StockOnHandListPage() {
  const { canView } = usePermissions();

  if (!canView) return <ForbiddenPage />;

  const [data, setData] = useState<StockOnHand[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<any>(null);

  // 🔹 filter states
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [locationId, setLocationId] = useState<string | undefined>("");
  const [locationName, setLocationName] = useState<string | undefined>("");

  useEffect(() => {
    const timeout = setTimeout(() => setSearch(searchInput), 500);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await getStockOnHands({
        search,
        location_id: locationId || undefined,
      });
      setData(result);
    } catch (err: any) {
      setError(err.message || "Failed to fetch Inventory On Hand");
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
      const blob = await printStockOnHandsPDF({
        search,
        location_id: locationId || undefined,
        location_name: locationName || undefined,
      });
      downloadBlob(blob, "inventory-on-hand.pdf");
    } catch (err: any) {
      showErrorToast(err.message || "Export to PDF failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadExcel = async () => {
    setLoading(true);
    try {
      const blob = await printStockOnHandsExcel({
        search,
        location_id: locationId || undefined,
        location_name: locationName || undefined,
      });
      downloadBlob(blob, "inventory-on-hand.xlsx");
    } catch (err: any) {
      showErrorToast(err.message || "Export to excel failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, locationId]);

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

  const columns = useMemo<ColumnDef<StockOnHand>[]>(
    () => [
      {
        id: "number",
        header: "#",
        cell: ({ row }) => {
          return <div>{row.index + 1}</div>;
        },
        size: 40,
      },
      { accessorKey: "item_code", header: "Item Code" },
      { accessorKey: "item_name", header: "Item Name" },
      { accessorKey: "location", header: "Stored Location" },
      {
        accessorKey: "current_qty",
        header: "Current QTY",
        cell: ({ row }) => (
          <span className="font-semibold">{row.original.current_qty}</span>
        ),
      },
      {
        accessorKey: "last_movement",
        header: "Last Movement",
        cell: ({ row }) =>
          row.original.last_movement
            ? new Date(row.original.last_movement).toLocaleString("id-ID")
            : "-",
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
      pagination: { pageIndex: 0, pageSize: 15 },
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Inventory On Hand</h1>

      {/* 🔹 filter section */}
      <div className="flex flex-wrap gap-4 mb-4 text-sm">
        <input
          type="text"
          placeholder="Enter SKU / Item Name..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="border border-(--content-border) bg-(--content-surface-hover) p-1 rounded text-(--muted) w-60"
        />

        <div className="w-48">
          <SearchSelect
            value={selectedLocation}
            placeholder="Enter Location"
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
