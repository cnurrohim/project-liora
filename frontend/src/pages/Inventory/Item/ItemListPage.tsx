import { useEffect, useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { getItems, deleteItem } from "@/pages/Inventory/Item/item.api";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { openTabSmart } from "@/utils/handleMenuClick/openTabSmart";
import { IconRenderer } from "@/components/IconRenderer";
import { EditButtonLink } from "@/components/Buttons/EditButtonLink";
import { DeleteButtonLink } from "@/components/Buttons/DeleteButtonLink";
import { ButtonGroupWithDropdown } from "@/components/Buttons/ButtonGroupWithDropdown";
import { ConfirmationDialogController } from "@/components/ConfirmationDialog/controller";
import ForbiddenPage from "pages/Misc/403";
import { usePermissions } from "./permissions";
import { DataTable } from "@/components/Table/DataTable";

type Item = {
  id: string;
  sku: string;
  name: string;
  min_stock: number;
};

export default function ItemListPage() {
  const { canView, canDelete, canUpdate, canCreate } = usePermissions();

  if (!canView) return <ForbiddenPage />;

  const [items, setItems] = useState<Item[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await getItems();
      setItems(data);
    } catch (err: any) {
      setError(err.message || "Failed to load inventory item");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const data = useMemo(() => items, [items]);

  const handleEdit = (item: Item) => {
    if (!canUpdate) {
      showErrorToast("We're sorry, you don't have access for this feature!");
      return;
    }

    openTabSmart(
      {
        id: `/item/${item.id}/edit`,
        route: `/item/${item.id}/edit`,
        label: `Edit: ${item.sku}`,
        type: "route",
        icon: "RiPencilFill",
      },
      { replace: true }
    );
  };

  const handleDelete = async (id: string) => {
    if (!canDelete) {
      showErrorToast("We're sorry, you don't have access for this feature!");
      return;
    }

    ConfirmationDialogController.askConfirmation(
      "You're about to delete this data, proceed?",
      async () => {
        try {
          await deleteItem(id);
          showSuccessToast("Item deleted");
          fetchItems();
        } catch (err: any) {
          showErrorToast(err.message);
        }
      }
    );
  };

  const columns = useMemo<ColumnDef<Item>[]>(
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
        accessorKey: "sku",
        header: "SKU",
      },
      {
        accessorKey: "name",
        header: "Inventory item",
      },
      {
        accessorKey: "min_stock",
        header: "Min Stock",
      },
      {
        id: "aksi",
        header: "Action",
        cell: ({ row }) => (
          <div className="flex gap-1">
            {canUpdate && (
              <EditButtonLink onClick={() => handleEdit(row.original)} />
            )}
            {canDelete && (
              <DeleteButtonLink onClick={() => handleDelete(row.original.id)} />
            )}
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
        id: "/item/create",
        route: "/item/create",
        label: "Add Item",
        type: "route",
        icon: "RiAddBoxLine",
      },
      { replace: !newTab, remember: true }
    );
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Inventory Items List</h1>
        {canCreate && (
          <ButtonGroupWithDropdown
            mainLabel={
              <>
                <IconRenderer name="RiAddBoxLine" size={15} />
                Add Inv. Item
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
    </div>
  );
}
