import {
  Controller,
  FormProvider,
  useForm,
  useFieldArray,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createStockAdjustment,
  getStockAdjustmentById,
  updateStockAdjustment,
} from "./stockAdjustment.api";
import { useEffect, useState } from "react";
import { useRouteParamsFromTab } from "@/hooks/useRouteParams";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import ForbiddenPage from "pages/Misc/403";
import { usePermissions } from "./permissions";
import {
  stockAdjustmentSchema,
  type StockAdjustmentFormValues,
} from "./formSchema";
import SearchSelect from "@/components/SelectOptions/searchSelect";
import { searchItems, searchLocationWithItem } from "@/api/search.api";
import { BackToListLink } from "@/components/Buttons/BackToListLink";

export default function StockAdjustmentFormPage() {
  const { canView, canUpdate, canCreate } = usePermissions();
  if (!canView) return <ForbiddenPage />;

  const { id } = useRouteParamsFromTab("/stock-adjustments/:id/edit");
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);

  const today = new Date();

  const methods = useForm<StockAdjustmentFormValues>({
    resolver: zodResolver(stockAdjustmentSchema),
    defaultValues: {
      adjustment_date: today.toISOString().substring(0, 10),
      reason: "",
      status: "draft",
      items: [],
    },
  });

  const {
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  useEffect(() => {
    const init = async () => {
      if (isEdit && id) {
        const sa = await getStockAdjustmentById(id);
        reset({
          adjustment_date: sa.adjustment_date,
          reason: sa.reason ?? "",
          status: sa.status ?? "draft",
          items: sa.items ?? [],
        });
      }
    };
    init();
  }, [isEdit, id, reset]);

  const handleSearchItem = async (keyword: string) => {
    if (!keyword || keyword.length < 2) return [];
    try {
      const results = await searchItems(keyword);
      return results.map((item: any) => ({
        id: item.id,
        name: `${item.sku} - ${item.name}`,
      }));
    } catch (err) {
      console.error(err);
      showErrorToast("Failed to fetch item");
      return [];
    }
  };

  const handleSearchLocation = async (keyword: string, index: number) => {
    if (!keyword || keyword.length < 2) return [];
    const itemId = methods.getValues(`items.${index}.item_id`);

    if (!itemId) {
      showErrorToast("Pick item first");
      return;
    }

    try {
      const results = await searchLocationWithItem(keyword, itemId);
      return results.map((location: any) => ({
        id: location.id,
        name: `${location.code}-${location.name}, qty:${location.qty}`,
        data: { qty: location.qty },
      }));
    } catch (err) {
      console.error(err);
      showErrorToast("Failed to fetch inventory location");
      return [];
    }
  };

  const onSubmit = async (data: StockAdjustmentFormValues) => {
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
      const cleanedData = {
        ...data,
        items: data.items.map(({ item_name, location_name, ...rest }) => rest),
      };

      if (isEdit) {
        await updateStockAdjustment(id!, cleanedData);
        showSuccessToast("Inventory Adjustment updated");
      } else {
        await createStockAdjustment(cleanedData);
        showSuccessToast("Inventory Adjustment created");
      }

      reset(methods.formState.defaultValues);
    } catch (err: any) {
      showErrorToast(err.message || "Saving Inventory Adjustment Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full p-4">
        <BackToListLink
          route="/pages/inventory/stock-adjustments"
          label="list inventory adjustments"
        />

        <h1 className="text-xl font-bold">
          {isEdit ? "Edit Inventory Adjustment" : "Create Inventory Adjustment"}
        </h1>

        {/* Adjustment Date */}
        <div>
          <label className="block text-(--content-text-muted)">
            Adjustment Date
          </label>
          <Controller
            name="adjustment_date"
            control={control}
            render={({ field }) => (
              <input
                type="date"
                className="w-full p-2 bg-(--content-surface-hover) rounded"
                {...field}
              />
            )}
          />
          {errors.adjustment_date && (
            <p className="text-(--danger) text-sm">
              {errors.adjustment_date.message}
            </p>
          )}
        </div>

        {/* Reason */}
        <div>
          <label className="block text-(--content-text-muted)">
            Adjustment Note
          </label>
          <Controller
            name="reason"
            control={control}
            render={({ field }) => (
              <textarea
                className="w-full p-2 bg-(--content-surface-hover) rounded"
                {...field}
                value={field.value ?? ""} // <--- null/undefined jadi string kosong
              />
            )}
          />

          {errors.reason && (
            <p className="text-(--danger) text-sm">{errors.reason.message}</p>
          )}
        </div>

        {/* Items */}
        <div>
          <table className="table-auto border border-(--content-border) border-collapse w-full">
            <thead>
              <tr>
                <th className="border border-(--content-border) px-2 py-1">
                  Item
                </th>
                <th className="border border-(--content-border) px-2 py-1">
                  Stored Location
                </th>
                <th className="border border-(--content-border) px-2 py-1">
                  Qty
                </th>
                <th className="border border-(--content-border) px-2 py-1">
                  Adj. (+/-)
                </th>
                <th className="border border-(--content-border) px-2 py-1">
                  Notes
                </th>
                <th className="border border-(--content-border) px-2 py-1">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field, index) => (
                <tr key={field.id}>
                  {/* Item */}
                  <td className="border border-(--content-border) px-2 py-1">
                    <Controller
                      name={`items.${index}.item_id`}
                      control={control}
                      render={({ field }) => {
                        const currentName = methods.watch(
                          `items.${index}.item_name`
                        );
                        return (
                          <SearchSelect
                            value={
                              field.value
                                ? { id: field.value, name: currentName || "" }
                                : null
                            }
                            onChange={(val) => {
                              field.onChange(val?.id || "");
                              methods.setValue(
                                `items.${index}.item_name`,
                                val?.name || ""
                              );

                              if (!val?.id) {
                                methods.setValue(
                                  `items.${index}.location_id`,
                                  ""
                                );
                                methods.setValue(
                                  `items.${index}.quantity_before`,
                                  0
                                );
                              }
                            }}
                            fetchOptions={handleSearchItem}
                          />
                        );
                      }}
                    />

                    {typeof errors.items?.[index]?.item_id?.message ===
                      "string" && (
                      <p className="text-(--danger) text-sm">
                        {errors.items[index]?.item_id?.message}
                      </p>
                    )}
                  </td>

                  {/* Location */}
                  <td className="border border-(--content-border) px-2 py-1">
                    <Controller
                      name={`items.${index}.location_id`}
                      control={control}
                      render={({ field }) => {
                        const currentName = methods.watch(
                          `items.${index}.location_name`
                        );
                        return (
                          <SearchSelect
                            value={
                              field.value
                                ? { id: field.value, name: currentName || "" }
                                : null
                            }
                            onChange={(val) => {
                              field.onChange(val?.id || "");
                              methods.setValue(
                                `items.${index}.location_name`,
                                val?.name || ""
                              );

                              if (val?.data?.qty !== undefined) {
                                methods.setValue(
                                  `items.${index}.quantity_before`,
                                  val.data.qty
                                );
                              }

                              if (!val?.id) {
                                methods.setValue(
                                  `items.${index}.quantity_before`,
                                  0
                                );
                              }
                            }}
                            fetchOptions={(val) =>
                              handleSearchLocation(val, index)
                            }
                          />
                        );
                      }}
                    />

                    {typeof errors.items?.[index]?.location_id?.message ===
                      "string" && (
                      <p className="text-(--danger) text-sm">
                        {errors.items[index]?.location_id?.message}
                      </p>
                    )}
                  </td>

                  {/* Current Quantity */}
                  <td className="border border-(--content-border) px-2 py-1">
                    <Controller
                      name={`items.${index}.quantity_before`}
                      control={control}
                      render={({ field }) => (
                        <input
                          type="number"
                          disabled
                          readOnly
                          placeholder="current qty"
                          className="w-24 p-2 bg-(--content-surface-hover) rounded"
                          {...field}
                          value={field.value ?? 0}
                        />
                      )}
                    />
                    {errors.items?.[index]?.quantity_before && (
                      <p className="text-(--danger) text-sm">
                        {errors.items[index]?.quantity_before?.message}
                      </p>
                    )}
                  </td>

                  {/* Quantity Diff */}
                  <td className="border border-(--content-border) px-2 py-1">
                    <Controller
                      name={`items.${index}.quantity_diff`}
                      control={control}
                      render={({ field }) => (
                        <input
                          type="string"
                          inputMode="numeric"
                          placeholder="+/- Qty"
                          className="w-24 p-2 bg-(--content-surface-hover) rounded"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      )}
                    />

                    {errors.items?.[index]?.quantity_diff && (
                      <p className="text-(--danger) text-sm">
                        {errors.items[index]?.quantity_diff?.message}
                      </p>
                    )}
                  </td>

                  {/* Notes */}
                  <td className="border border-(--content-border) px-2 py-1">
                    <Controller
                      name={`items.${index}.notes`}
                      control={control}
                      render={({ field }) => (
                        <input
                          type="text"
                          placeholder="Note"
                          className="w-full p-2 bg-(--content-surface-hover) rounded"
                          {...field}
                          value={field.value ?? ""} // <-- pastikan bukan null
                        />
                      )}
                    />
                  </td>

                  {/* Action */}
                  <td className="border border-(--content-border) px-2 py-1">
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="px-2 py-1 cursor-pointer bg-(--danger) hover:bg-(--danger-hover) text-(--success-foreground) rounded"
                    >
                      delete
                    </button>
                  </td>
                </tr>
              ))}

              <tr>
                <td colSpan={5} className="text-center">
                  <button
                    type="button"
                    onClick={() =>
                      append({
                        item_id: "",
                        location_id: "",
                        quantity_diff: 0,
                        quantity_before: 0,
                        notes: "",
                      })
                    }
                    className="px-3 py-1 cursor-pointer bg-(--success) hover:bg-(--success-hover) text-(--success-foreground) rounded"
                  >
                    + Add Item
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
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
