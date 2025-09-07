import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  stockLocationsSchema,
  type StockLocationsFormValues,
} from "./formSchema";
import {
  createStockLocation,
  getStockLocationById,
  updateStockLocation,
} from "./stockLocations.api";
import { useEffect, useState } from "react";
import { useRouteParamsFromTab } from "@/hooks/useRouteParams";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import ForbiddenPage from "pages/Misc/403";
import { usePermissions } from "./permissions";
import { BackToListLink } from "@/components/Buttons/BackToListLink";

export default function StockLocationsFormPage() {
  const { canView, canUpdate, canCreate } = usePermissions();
  if (!canView) return <ForbiddenPage />;

  const { id } = useRouteParamsFromTab("/locations/:id/edit");
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);

  const methods = useForm<StockLocationsFormValues>({
    resolver: zodResolver(stockLocationsSchema),
    defaultValues: {
      code: "",
      name: "",
      type: "",
      description: "",
    },
  });

  const {
    handleSubmit,
    reset,
    register,
    formState: { errors },
  } = methods;

  useEffect(() => {
    if (isEdit && id) {
      getStockLocationById(id).then((loc) => {
        reset({
          code: loc.code,
          name: loc.name,
          type: loc.type,
          description: loc.description,
        });
      });
    }
  }, [isEdit, id, reset]);

  const onSubmit = async (data: StockLocationsFormValues) => {
    if (isEdit && !canUpdate) {
      showErrorToast("We're sorry, you don't have access for this feature!");
      return;
    }

    if (!isEdit && !canCreate) {
      showErrorToast("We're sorry, you don't have access for this feature!");
      return;
    }

    try {
      setLoading(true);
      if (isEdit) {
        await updateStockLocation(id!, data);
        showSuccessToast("Inventory location updated");
      } else {
        await createStockLocation(data);
        showSuccessToast("New inventory location added");
      }
    } catch (err: any) {
      showErrorToast(err.message || "failed to add new inv. location");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 max-w-3/4 mx-auto p-4 "
      >
        <BackToListLink
          route="/pages/inventory/stock-location"
          label="list inventory locations"
        />

        <h1 className="text-xl font-bold">
          {isEdit ? "Edit Inventory Location" : "Add Inventory Location"}
        </h1>

        <div className="space-y-4">
          <div>
            <label className="block text-[var(--content-text-muted)]">
              Inventory location code
            </label>
            <input
              className="w-full p-2 bg-[var(--content-surface-hover)] rounded"
              {...register("code")}
            />
            {errors.code?.message && (
              <p className="text-[var(--danger)] text-sm">
                {errors.code.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-[var(--content-text-muted)]">
              Inventory location name
            </label>
            <input
              className="w-full p-2 bg-[var(--content-surface-hover)] rounded"
              {...register("name")}
            />
            {errors.name?.message && (
              <p className="text-[var(--danger)] text-sm">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-[var(--content-text-muted)]">
              Inventory location type
            </label>
            <select
              className="w-full p-2 bg-[var(--content-surface-hover)] rounded"
              {...register("type")}
            >
              <option value="">Choose ..</option>
              <option value="warehouse">Warehouse</option>
              <option value="store_display">Store Display</option>
              <option value="front_desk">Front Desk</option>
              <option value="cold_storage">Cold Storage</option>
              <option value="shipping_container">Shipping Container</option>
            </select>
            {errors.type?.message && (
              <p className="text-[var(--danger)] text-sm">
                {errors.type.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-[var(--content-text-muted)]">
              Descriptions
            </label>
            <textarea
              className="w-full p-2 bg-[var(--content-surface-hover)] rounded"
              {...register("description")}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-28 flex justify-center text-[var(--success-foreground)] items-center px-4 py-2 bg-[var(--info)] rounded hover:bg-[var(--info-hover)] disabled:opacity-50 cursor-pointer max-w-3/4"
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </form>
    </FormProvider>
  );
}
