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
  getItemDetails,
  printItemDetailsExcel,
  printItemDetailsPDF,
} from "@/pages/Inventory/Item/item.api";
import ForbiddenPage from "pages/Misc/403";
import { usePermissions } from "./permissions";
import { DataTable } from "@/components/Table/DataTable";
import { getStockLocations } from "../stockLocations/stockLocations.api";
import { showErrorToast } from "@/utils/toast";
import { IconRenderer } from "@/components/IconRenderer";

type Item = {
  id: string;
  sku: string;
  name: string;
  min_stock: number;
  locations: Record<string, number>;
};

type Location = {
  id: string;
  code: string;
  name: string;
  type: string;
  description: string | null;
};

export default function ItemDetailsListPage() {
  const { canView } = usePermissions();

  if (!canView) return <ForbiddenPage />;

  const [items, setItems] = useState<Item[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => setSearch(searchInput), 500);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await getItemDetails(search);
      setItems(data);
    } catch (err: any) {
      setError(err.message || "Failed to load inventory item");
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const data = await getStockLocations();
      setLocations(data);
    } catch (err: any) {
      setError(err.message || "Failed to load inventory location");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [search]);

  useEffect(() => {
    fetchItems();
    fetchLocations();
  }, []);

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
      const blob = await printItemDetailsPDF(search);

      downloadBlob(blob, "Inventory total per location.pdf");
    } catch (err: any) {
      showErrorToast(err.message || "Export to PDF failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadExcel = async () => {
    setLoading(true);
    try {
      const blob = await printItemDetailsExcel(search);

      downloadBlob(blob, "Inventory total per location.xlsx");
    } catch (err: any) {
      showErrorToast(err.message || "Export to excel failed");
    } finally {
      setLoading(false);
    }
  };

  const data = useMemo(() => items, [items]);

  const columns = useMemo<ColumnDef<Item>[]>(() => {
    const baseColumns: ColumnDef<Item>[] = [
      {
        id: "number",
        header: () => <div className="text-left">#</div>,
        cell: ({ row }) => <div>{row.index + 1}</div>,
        size: 50,
      },
      {
        accessorKey: "sku",
        header: "SKU",
      },
      {
        accessorKey: "name",
        header: "Inventory item",
      },
    ];

    const locationColumns: ColumnDef<Item>[] = locations.map((loc) => ({
      id: loc.id,
      header: `${loc.code} - ${loc.name}`,
      cell: ({ row }) => {
        const qty = row.original.locations?.[loc.id] ?? 0;
        return <div className="text-center">{qty}</div>;
      },
    }));

    const totalColumn: ColumnDef<Item> = {
      id: "total_qty",
      header: "Total",
      cell: ({ row }) => {
        const locations = row.original.locations || {};
        const total = Object.values(locations).reduce(
          (sum, v) => sum + (v ?? 0),
          0
        );
        return <div className="text-center font-semibold">{total}</div>;
      },
    };

    return [...baseColumns, ...locationColumns, totalColumn];
  }, [locations]);

  const table = useReactTable({
    data,
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
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Inventory Items List</h1>
      </div>

      <div className="flex flex-wrap gap-4 mb-10 text-sm">
        <input
          type="text"
          placeholder="Enter SKU / Item Name..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="border border-(--content-border) bg-(--content-surface-hover) p-1 rounded w-60"
        />

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
