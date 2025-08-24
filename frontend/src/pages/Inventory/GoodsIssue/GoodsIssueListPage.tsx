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
import { getGoodsIssues, getGoodsIssueDetail } from "./goodsIssue.api";
import { openTabSmart } from "@/utils/handleMenuClick/openTabSmart";
import { IconRenderer } from "@/components/IconRenderer";
import { ViewButtonLink } from "@/components/Buttons/ViewButtonLink";
import { ButtonGroupWithDropdown } from "@/components/Buttons/ButtonGroupWithDropdown";
import ForbiddenPage from "pages/Misc/403";
import { usePermissions } from "./permissions";
import {
  GoodsIssueDetailPane,
  GoodsIssueDetailPaneController,
} from "./GoodsIssueDetailPane";

type Issue = {
  id: string;
  issue_number: string;
  issue_date: string;
  created_by_name?: string | null;
  notes?: string | null;
};

export default function GoodsIssueListPage() {
  const { canView, canCreate } = usePermissions();

  if (!canView) return <ForbiddenPage />;

  const [issues, setIssues] = useState<Issue[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const data = await getGoodsIssues();
      setIssues(data);
    } catch (err: any) {
      setError(err.message || "Gagal memuat data Issue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const data = useMemo(() => issues, [issues]);

  const handleView = async (id: string) => {
    try {
      const detail = await getGoodsIssueDetail(id);
      GoodsIssueDetailPaneController.open(detail);
    } catch (err) {
      console.error("Gagal ambil detail Issue", err);
    }
  };

  const columns = useMemo<ColumnDef<Issue>[]>(
    () => [
      {
        id: "number",
        header: () => <div className="text-left">#</div>,
        cell: ({ row }) => {
          const { pageIndex, pageSize } = table.getState().pagination;
          return <div>{pageIndex * pageSize + row.index + 1}</div>;
        },
        size: 50,
      },
      {
        accessorKey: "issue_number",
        header: "Nomor Issue",
      },
      {
        accessorKey: "issue_date",
        header: "Tanggal",
        cell: ({ row }) =>
          new Date(row.original.issue_date).toLocaleDateString(),
      },
      {
        accessorKey: "created_by_name",
        header: "issued by",
        cell: ({ row }) => row.original.created_by_name || "-",
      },
      {
        accessorKey: "notes",
        header: "Catatan",
        cell: ({ row }) => row.original.notes || "-",
      },
      {
        id: "aksi",
        header: "Aksi",
        cell: ({ row }) => (
          <div className="flex gap-1">
            <ViewButtonLink onClick={() => handleView(row.original.id)} />
          </div>
        ),
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

  const openInNewTab = (newTab = false) => {
    openTabSmart(
      {
        id: "/goods-issues/create",
        route: "/goods-issues/create",
        label: "Tambah Issue",
        type: "route",
        icon: "RiArrowRightUpBoxLine",
      },
      { replace: !newTab, remember: true }
    );
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Goods Issue List</h1>
        {canCreate && (
          <ButtonGroupWithDropdown
            mainLabel={
              <>
                <IconRenderer
                  name="RiAddBoxLine"
                  size={15}
                  className="text-white"
                />
                Tambah Issue
              </>
            }
            onClick={() => openInNewTab(false)}
            dropdownItems={[
              {
                label: (
                  <>
                    <IconRenderer name="RiArrowRightUpBoxLine" size={15} />
                    Open in new tab
                  </>
                ),
                onClick: () => openInNewTab(true),
              },
            ]}
          />
        )}
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
                        style={
                          header.column.id === "number"
                            ? { width: "40px" }
                            : undefined
                        }
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
      <GoodsIssueDetailPane />
    </div>
  );
}
