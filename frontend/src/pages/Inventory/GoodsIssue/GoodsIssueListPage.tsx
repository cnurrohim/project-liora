import { useEffect, useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
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
import { DataTable } from "@/components/Table/DataTable";

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

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => setSearch(searchInput), 500);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const data = await getGoodsIssues(search);
      setIssues(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch Goods Issue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [search]);

  const data = useMemo(() => issues, [issues]);

  const handleView = async (id: string) => {
    try {
      const detail = await getGoodsIssueDetail(id);
      GoodsIssueDetailPaneController.open(detail);
    } catch (err) {
      console.error("Failed to fetch detail Issue", err);
    }
  };

  const columns = useMemo<ColumnDef<Issue>[]>(
    () => [
      {
        id: "number",
        header: () => <div className="text-left">#</div>,
        cell: ({ row }) => {
          return <div>{row.index + 1}</div>;
        },
        size: 50,
      },
      {
        accessorKey: "issue_number",
        header: "Issue Number",
      },
      {
        accessorKey: "issue_date",
        header: "Issue Date",
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
        header: "Note",
        cell: ({ row }) => row.original.notes || "-",
      },
      {
        id: "aksi",
        header: "Action",
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
        label: "Create Goods Issue",
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
      </div>

      {/* 🔹 filter section */}
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search PO Number"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="border border-(--content-border) bg-(--content-surface-hover) p-1 rounded w-90"
        />
        {canCreate && (
          <ButtonGroupWithDropdown
            mainLabel={
              <>
                <IconRenderer name="RiAddBoxLine" size={15} />
                Create Issue
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

      {error && <div className="text-(--danger) mb-2">{error}</div>}
      {loading ? (
        <div>Fetching...</div>
      ) : (
        <>
          <DataTable table={table} />
        </>
      )}
      <GoodsIssueDetailPane />
    </div>
  );
}
