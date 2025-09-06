// src/routes/GoodsReceiptFormPage.tsx
import {
  Controller,
  FormProvider,
  useForm,
  useFieldArray,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createGoodsReceipt,
  getGoodsReceiptById,
  updateGoodsReceipt,
} from "./goodsReceipt.api";
import { useEffect, useState } from "react";
import { useRouteParamsFromTab } from "@/hooks/useRouteParams";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import ForbiddenPage from "pages/Misc/403";
import { usePermissions } from "./permissions";
import { goodsReceiptSchema, type GoodsReceiptFormValues } from "./formSchema";
import SingleSelect from "@/components/SelectOptions/SingleSelect";
import { getSuppliers } from "../Supplier/supplier.api";
import { getItems } from "../Item/item.api";
import SearchSelect from "@/components/SelectOptions/searchSelect";
import { searchLocation } from "@/api/search.api";
import { BackToListLink } from "@/components/Buttons/BackToListLink";

type Option = {
  id: string;
  name: string;
};

export default function GoodsReceiptFormPage() {
  const { canView, canUpdate, canCreate } = usePermissions();
  if (!canView) return <ForbiddenPage />;

  const { id } = useRouteParamsFromTab("/goods-receipts/:id/edit");
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);

  const [allSuppliers, setAllSuppliers] = useState<Option[]>([]);
  const [allItems, setAllItems] = useState<Option[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Option | null>(null);

  const today = new Date();

  const methods = useForm<GoodsReceiptFormValues>({
    resolver: zodResolver(goodsReceiptSchema),
    defaultValues: {
      supplier_id: "",
      location_id: "",
      receipt_date: today.toISOString().substring(0, 10),
      notes: "",
      items: [],
    },
  });

  const {
    handleSubmit,
    reset,
    register,
    formState: { errors },
    control,
  } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  useEffect(() => {
    const init = async () => {
      const suppliers = await getSuppliers();
      setAllSuppliers(suppliers.map((s: any) => ({ id: s.id, name: s.name })));

      const items = await getItems();
      setAllItems(
        items.map((i: any) => ({ id: i.id, name: `${i.sku} - ${i.name}` }))
      );

      if (isEdit && id) {
        const gr = await getGoodsReceiptById(id);
        reset({
          supplier_id: gr.supplier_id ?? "",
          location_id: gr.location_id ?? "",
          receipt_date: gr.receipt_date,
          notes: gr.notes ?? "",
          items: gr.items ?? [],
        });
      }
    };

    init();
  }, [isEdit, id, reset]);

  const handleTargetLocation = async (keyword: string) => {
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

  const onSubmit = async (data: GoodsReceiptFormValues) => {
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
        await updateGoodsReceipt(id!, data);
        showSuccessToast("Goods Receipt updated");
      } else {
        await createGoodsReceipt(data);
        showSuccessToast("Goods Receipt created");
      }
    } catch (err: any) {
      showErrorToast(err.message || "Saving goods receipt failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 max-w-2/3 mx-auto w-full p-4"
      >
        <BackToListLink
          route="/pages/inventory/goods-receipts"
          label="list good receipts"
        />

        <h1 className="text-xl font-bold">
          {isEdit ? "Edit Goods Receipt" : "Create Goods Receipt"}
        </h1>

        <div className="space-y-4">
          {/* Supplier */}
          <div>
            <label className="block">Supplier (optional)</label>
            <Controller
              name="supplier_id"
              control={control}
              render={({ field }) => (
                <SingleSelect
                  options={allSuppliers}
                  value={
                    allSuppliers.find((opt) => opt.id === field.value) ?? null
                  }
                  onChange={(val) => field.onChange(val ? val.id : null)}
                  placeholder="Pilih Supplier (jika ada)"
                />
              )}
            />
            {typeof errors.supplier_id?.message === "string" && (
              <p className="text-[var(--danger)] text-sm">
                {errors.supplier_id.message}
              </p>
            )}
          </div>

          <div>
            <label className="block">Stored Location</label>
            {/* Target Location */}

            <Controller
              name="location_id"
              control={control}
              render={({ field }) => (
                <SearchSelect
                  value={selectedLocation}
                  onChange={(val) => {
                    setSelectedLocation(val);
                    field.onChange(val ? val.id : "");
                  }}
                  fetchOptions={handleTargetLocation}
                />
              )}
            />
          </div>

          {/* Receipt date */}
          <div>
            <label className="block">Receipt Date</label>
            <input
              type="date"
              className="w-full p-2 bg-[var(--background)] rounded"
              {...register("receipt_date")}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block">Note</label>
            <textarea
              className="w-full p-2 bg-[var(--background)] rounded"
              {...register("notes")}
            />
          </div>

          {/* Items */}
          <div>
            <table className="table-auto border border-[var(--border)] border-collapse w-full">
              <thead>
                <tr>
                  <th className="border border-[var(--border)] px-2 py-1">
                    Items
                  </th>
                  <th className="border border-[var(--border)] px-2 py-1">
                    Qty
                  </th>
                  <th className="border border-[var(--border)] px-2 py-1">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {fields.map((field, index) => (
                  <tr key={field.id}>
                    <td className="border border-[var(--border)] px-2 py-1">
                      <Controller
                        name={`items.${index}.item_id`}
                        control={control}
                        render={({ field }) => (
                          <SingleSelect
                            options={allItems}
                            value={
                              allItems.find((opt) => opt.id === field.value) ??
                              null
                            }
                            onChange={(val) =>
                              field.onChange(val ? val.id : null)
                            }
                            placeholder="Pilih Item"
                          />
                        )}
                      />
                    </td>
                    <td className="border border-[var(--border)] px-2 py-1">
                      <input
                        type="number"
                        placeholder="Qty"
                        className="w-24 p-2 bg-[var(--background)] rounded"
                        {...register(`items.${index}.quantity`, {
                          valueAsNumber: true,
                        })}
                      />
                    </td>
                    <td className="border border-[var(--border)] px-2 py-1">
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="px-2 py-1 cursor-pointer bg-[var(--danger)] hover:bg-[var(--danger-hover)] text-[var(--text-primary)] rounded"
                      >
                        delete
                      </button>
                    </td>
                  </tr>
                ))}
                <tr>
                  <td className="text-lefet">
                    <button
                      type="button"
                      onClick={() =>
                        append({ item_id: "", quantity: 1, notes: "" })
                      }
                      className="px-3 py-1 cursor-pointer bg-[var(--success)] hover:bg-[var(--success-hover)] text-[var(--text-primary)] rounded"
                    >
                      + Add Item
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
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
