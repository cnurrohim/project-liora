import { flexRender, type Table } from "@tanstack/react-table";

interface DataTableProps<T> {
  table: Table<T>;
  showPagination?: boolean;
}

export function DataTable<T>({
  table,
  showPagination = true,
}: DataTableProps<T>) {
  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[var(--content-surface-hover)] text-[var(--content-text-muted)]">
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
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={table.getAllLeafColumns().length}
                  className="p-4 text-center text-sm text-gray-500"
                >
                  No Data Found
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-[var(--content-border)]"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-2 align-top">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showPagination && (
        <div className="flex justify-between items-center text-sm">
          <div>
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <div className="space-x-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="cursor-pointer px-2 py-1 bg-[var(--content-surface-hover)] text-[var(--content-text)] rounded disabled:opacity-50"
            >
              Prev
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="cursor-pointer px-2 py-1 bg-[var(--content-surface-hover)] text-[var(--content-text)] rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
