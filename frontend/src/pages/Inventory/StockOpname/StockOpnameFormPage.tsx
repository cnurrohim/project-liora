import {
  Controller,
  FormProvider,
  useForm,
  useFieldArray,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useRouteParamsFromTab } from "@/hooks/useRouteParams";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import ForbiddenPage from "pages/Misc/403";
import { usePermissions } from "./permissions";
import { stockOpnameSchema, type StockOpnameFormValues } from "./formSchema"; // <- bikin schema sendiri
import { searchItemsByLocationId } from "@/api/search.api";
import SearchSelect from "@/components/SelectOptions/searchSelect";
import {
  createStockOpname,
  updateStockOpname,
  getStockOpnameById,
} from "./stockOpname.api";
import { BackToListLink } from "@/components/Buttons/BackToListLink";
import SingleSelect from "@/components/SelectOptions/SingleSelect";
import { getStockLocations } from "../stockLocations/stockLocations.api";

type Option = {
  id: string;
  name: string;
};

export default function StockOpnameFormPage() {
  const { canView, canUpdate, canCreate, canReview } = usePermissions();
  if (!canView) return <ForbiddenPage />;

  const { id: editId } = useRouteParamsFromTab("/stock-opname/:id/edit");
  const { id: reviewId } = useRouteParamsFromTab("/stock-opname/:id/review");
  const submitLabelReview = reviewId && "Save";
  const submitLabelEdit = editId && "Update";
  const submitLabel = submitLabelEdit || submitLabelReview || "Save";

  const id = editId || reviewId;
  const isEdit = !!editId;
  const isReviewing = !!reviewId;

  const [loading, setLoading] = useState(false);
  const [isReviewed, setIsReviewed] = useState(false);
  const [allLocations, setAllLocation] = useState<Option[]>([]);

  const today = new Date();

  const methods = useForm<StockOpnameFormValues>({
    resolver: zodResolver(stockOpnameSchema),
    defaultValues: {
      opname_date: today.toISOString().substring(0, 10),
      notes: "",
      review_note: "",
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
      const locations = await getStockLocations();
      setAllLocation(
        locations.map((s: any) => ({ id: s.id, name: `${s.code} - ${s.name}` }))
      );

      if (isEdit || (isReviewing && id)) {
        const so = await getStockOpnameById(id);

        setIsReviewed(!!so.reviewed_at);

        reset({
          opname_date: so.opname_date ? so.opname_date.substring(0, 10) : "",
          notes: so.notes ?? "",
          review_note: so.review_note ?? "",
          status: isReviewing ? "reviewed" : so.status ?? "draft",
          location_id: so.location_id,
          location_name: so.location_name,
          items: so.items ?? [],
        });
      }
    };
    init();
  }, [isEdit, isReviewing, id, reset]);

  const handleSearchItem = async (keyword: string, location_id: string) => {
    if (!keyword || keyword.length < 2) return [];
    try {
      const results = await searchItemsByLocationId(keyword, location_id);
      return results.map((item: any) => ({
        id: item.id,
        name: `${item.sku} - ${item.name}, qty: ${item.qty}`,
        data: { qty: item.qty },
      }));
    } catch (err) {
      console.error(err);
      showErrorToast("Failed to fetch item");
      return [];
    }
  };

  const onSubmit = async (data: StockOpnameFormValues) => {
    if (isEdit && !canUpdate) {
      showErrorToast("We're sorry, you don't have access for update!");
      return;
    }

    if (isReviewing && !canReview) {
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
        items: data.items.map(({ item_name, ...rest }) => rest),
      };

      if (isEdit || isReviewing) {
        await updateStockOpname(id!, cleanedData);
        const messageEdit = "Inventory Opname Updated";
        const messageReview = "Inventory Opname Reviewed";
        const successMessage = isEdit ? messageEdit : messageReview;
        showSuccessToast(successMessage);
      } else {
        await createStockOpname(cleanedData);
        showSuccessToast("Inventory Opname created");
        reset(methods.formState.defaultValues);
      }
    } catch (err: any) {
      showErrorToast(err.message || "Failed to create inventory ppname");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full p-4">
        <BackToListLink
          route="/pages/inventory/stock-opnames"
          label="Inventory opnames list"
        />

        <h1 className="text-xl font-bold">
          {isEdit
            ? "Edit Inventory Opname"
            : isReviewing
            ? "Review Inventory Opname"
            : "New Inventory Opname"}
        </h1>

        {/* Opname Date */}
        <div>
          <label className="block text-[var(--content-text-muted)]">
            Opname Date
          </label>
          <Controller
            name="opname_date"
            control={control}
            render={({ field }) => (
              <input
                type="date"
                className="w-full p-2 bg-[var(--content-surface-hover)] rounded"
                {...field}
              />
            )}
          />
          {errors.opname_date && (
            <p className="text-[var(--danger)] text-sm">
              {errors.opname_date.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-[var(--content-text-muted)]">
            Inventory Location
          </label>

          <Controller
            name="location_id"
            control={control}
            render={({ field }) => (
              <SingleSelect
                options={allLocations}
                value={
                  allLocations.find((opt) => opt.id === field.value) ?? null
                }
                onChange={(val) => {
                  field.onChange(val ? val.id : null);
                  methods.setValue(`location_name`, val?.name || "");
                  methods.setValue("items", []);
                }}
                placeholder="Choose Inventory Location"
              />
            )}
          />

          {typeof errors.location_id?.message === "string" && (
            <p className="text-[var(--danger)] text-sm">
              {errors.location_id.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-[var(--content-text-muted)]">Note</label>
          <Controller
            name="notes"
            control={control}
            render={({ field }) => (
              <textarea
                readOnly={isReviewing}
                className="w-full p-2 bg-[var(--content-surface-hover)] rounded"
                {...field}
                value={field.value ?? ""}
              />
            )}
          />

          {errors.notes && (
            <p className="text-[var(--danger)] text-sm">
              {errors.notes.message}
            </p>
          )}
        </div>

        {(isReviewing || (id && isReviewed)) && (
          <div>
            <label className="block text-[var(--content-text-muted)]">
              Review Note
            </label>
            <Controller
              name="review_note"
              control={control}
              render={({ field }) => (
                <textarea
                  readOnly={!canReview}
                  className="w-full p-2 bg-[var(--content-surface-hover)] rounded"
                  {...field}
                  value={field.value ?? ""}
                />
              )}
            />

            {errors.review_note && (
              <p className="text-[var(--danger)] text-sm">
                {errors.review_note.message}
              </p>
            )}
          </div>
        )}

        {/* Items */}
        <div>
          <table className="table-auto border border-[var(--content-border)] border-collapse w-full">
            <thead>
              <tr>
                <th className="border border-[var(--content-border)] px-2 py-1">
                  Item
                </th>
                <th className="border border-[var(--content-border)] px-2 py-1">
                  Qty System
                </th>
                <th className="border border-[var(--content-border)] px-2 py-1">
                  Qty Counted
                </th>
                <th className="border border-[var(--content-border)] px-2 py-1">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field, index) => (
                <tr key={field.id}>
                  {/* Item */}
                  <td className="border border-[var(--content-border)] px-2 py-1">
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
                              if (val?.data?.qty !== undefined) {
                                methods.setValue(
                                  `items.${index}.quantity_system`,
                                  val.data.qty
                                );
                              }
                            }}
                            fetchOptions={(val) => {
                              const location_id = methods.watch(`location_id`);
                              if (!location_id) {
                                showErrorToast(
                                  "Please choose inventory location first"
                                );
                                return Promise.resolve([]);
                              }
                              return handleSearchItem(val, location_id);
                            }}
                          />
                        );
                      }}
                    />
                    {typeof errors.items?.[index]?.item_id?.message ===
                      "string" && (
                      <p className="text-[var(--danger)] text-sm">
                        {errors.items[index]?.item_id?.message}
                      </p>
                    )}
                  </td>

                  {/* Qty System */}
                  <td className="border border-[var(--content-border)] px-2 py-1">
                    <Controller
                      name={`items.${index}.quantity_system`}
                      control={control}
                      render={({ field }) => (
                        <input
                          type="number"
                          disabled
                          readOnly
                          className="w-24 p-2 bg-[var(--content-surface-hover)] rounded"
                          {...field}
                          value={Number(field.value) ?? 0}
                        />
                      )}
                    />
                  </td>

                  {/* Qty Counted */}
                  <td className="border border-[var(--content-border)] px-2 py-1">
                    <Controller
                      name={`items.${index}.quantity_counted`}
                      control={control}
                      render={({ field }) => (
                        <input
                          type="string"
                          inputMode="numeric"
                          className="w-24 p-2 bg-[var(--content-surface-hover)] rounded"
                          {...field}
                          value={Number(field.value) ?? 0}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value) || 0)
                          }
                        />
                      )}
                    />
                  </td>

                  {/* Action */}
                  <td className="border border-[var(--content-border)] px-2 py-1">
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="px-2 py-1 bg-[var(--danger)] text-[var(--danger-foreground)] rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              <tr>
                <td colSpan={4} className="text-center">
                  <button
                    type="button"
                    onClick={() =>
                      append({
                        item_id: "",
                        quantity_system: 0,
                        quantity_counted: 0,
                      })
                    }
                    className="px-3 py-1 bg-[var(--success)] text-[var(--success-foreground)] rounded"
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
          className="w-28 flex justify-center text-[var(--success-foreground)] items-center px-4 py-2 bg-[var(--info)] rounded hover:bg-[var(--info-hover)] disabled:opacity-50 cursor-pointer max-w-3/4"
        >
          {loading ? "Saving..." : submitLabel}
        </button>
      </form>
    </FormProvider>
  );
}
