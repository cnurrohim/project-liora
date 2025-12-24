import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createItem, getItemById, updateItem } from "./item.api";
import { useEffect, useState } from "react";
import { useRouteParamsFromTab } from "@/hooks/useRouteParams";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import ForbiddenPage from "pages/Misc/403";
import { usePermissions } from "./permissions";
import { itemSchema, type ItemFormValues } from "./formSchema";
import { BackToListLink } from "@/components/Buttons/BackToListLink";

export default function ItemFormPage() {
  const { canView, canUpdate, canCreate } = usePermissions();

  if (!canView) return <ForbiddenPage />;

  const { id } = useRouteParamsFromTab("/item/:id/edit");
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);

  const methods = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      sku: "",
      name: "",
      min_stock: 0,
    },
  });

  const {
    handleSubmit,
    reset,
    register,
    formState: { errors },
  } = methods;

  useEffect(() => {
    const init = async () => {
      if (isEdit && id) {
        getItemById(id).then((item) => {
          reset({
            sku: item.sku,
            name: item.name,
            min_stock: item.min_stock ?? 0,
          });
        });
      }
    };

    init();
  }, [isEdit, id, reset]);

  const onSubmit = async (data: ItemFormValues) => {
    if (isEdit && !canUpdate) {
      showErrorToast("We're sorry, you don't have access for update!");
      return;
    }

    if (!isEdit && !canCreate) {
      showErrorToast("We're sorry, you don't have access for create!");
      return;
    }

    try {
      setLoading(true);
      if (isEdit) {
        await updateItem(id!, data);
        showSuccessToast("Item Updated");
      } else {
        await createItem(data);
        showSuccessToast("New Item Created");
      }
    } catch (err: any) {
      showErrorToast(err.message || "Failed to add new item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 max-w-3/4 mx-auto w-full p-4"
      >
        <BackToListLink route="/pages/inventory/item" label="list items" />
        <h1 className="text-xl font-bold">
          {isEdit ? "Edit Inventory Item" : "Add Inventory Item"}
        </h1>

        <div className="space-y-4">
          <div>
            <label className="block text-(--content-text-muted)">SKU</label>
            <input
              className="w-full p-2 bg-(--content-surface-hover) rounded"
              {...register("sku")}
            />
            {typeof errors.sku?.message === "string" && (
              <p className="text-(--danger) text-sm">{errors.sku.message}</p>
            )}
          </div>

          <div>
            <label className="block text-(--content-text-muted)">
              Nama Barang
            </label>
            <input
              className="w-full p-2 bg-(--content-surface-hover) rounded"
              {...register("name")}
            />
            {typeof errors.name?.message === "string" && (
              <p className="text-(--danger) text-sm">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-(--content-text-muted)">
              Minimal Stok
            </label>
            <input
              type="number"
              className="w-full p-2 bg-(--content-surface-hover) rounded"
              {...register("min_stock", { valueAsNumber: true })}
            />
            {typeof errors.min_stock?.message === "string" && (
              <p className="text-(--danger) text-sm">
                {errors.min_stock.message}
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-28 flex justify-center text-(--success-foreground) items-center px-4 py-2 bg-(--info) rounded hover:bg-(--info-hover) disabled:opacity-50 cursor-pointer max-w-3/4"
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </form>
    </FormProvider>
  );
}
