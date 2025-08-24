// src/routes/StockIssueFormPage.tsx
import {
  Controller,
  FormProvider,
  useForm,
  useFieldArray,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createGoodsIssue,
  getGoodsIssueById,
  updateGoodsIssue,
} from "./goodsIssue.api";
import { useEffect, useState } from "react";
import { useRouteParamsFromTab } from "@/hooks/useRouteParams";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import ForbiddenPage from "pages/Misc/403";
import { usePermissions } from "./permissions";
import { issueSchema, type IssueFormValues } from "./formSchema";
import SearchSelect from "@/components/SelectOptions/searchSelect";
import {
  searchItems,
  searchLocation,
  searchLocationWithItem,
} from "@/api/search.api";

export default function GoodsIssueFormPage() {
  const { canView, canUpdate, canCreate } = usePermissions();
  if (!canView) return <ForbiddenPage />;

  const { id } = useRouteParamsFromTab("/stock-issues/:id/edit");
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);

  const today = new Date();

  const methods = useForm<IssueFormValues>({
    resolver: zodResolver(issueSchema),
    defaultValues: {
      issue_date: today.toISOString().substring(0, 10),
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
      if (isEdit && id) {
        const si = await getGoodsIssueById(id);
        reset({
          issue_date: si.issue_date,
          notes: si.notes ?? "",
          items: si.items ?? [],
        });
      }
    };

    init();
  }, [isEdit, id, reset]);

  const handleSearchItem = async (keyword: string) => {
    if (!keyword || keyword.length < 2) return [];
    try {
      const results = await searchItems(keyword); // array hasil
      return results.map((item: any) => ({
        id: item.id,
        name: `${item.sku} - ${item.name}`,
      }));
    } catch (err) {
      console.error(err);
      showErrorToast("Gagal mencari item");
      return [];
    }
  };

  const handleSearchLocation = async (keyword: string, index: number) => {
    if (!keyword || keyword.length < 2) return [];
    const itemId = methods.getValues(`items.${index}.item_id`);

    if (!itemId) {
      showErrorToast("Pilih item terlebih dahulu");
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
      showErrorToast("Gagal mencari lokasi");
      return [];
    }
  };

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
      showErrorToast("Gagal mencari lokasi");
      return [];
    }
  };

  const onSubmit = async (data: IssueFormValues) => {
    if (isEdit && !canUpdate) {
      showErrorToast("Anda tidak punya hak akses untuk update!");
      return;
    }
    if (!isEdit && !canCreate) {
      showErrorToast("Anda tidak punya hak akses untuk create!");
      return;
    }

    try {
      setLoading(true);
      const cleanedData = {
        ...data,
        items: data.items.map(
          ({
            item_name,
            source_location_name,
            target_location_name,
            max_qty,
            ...rest
          }) => rest
        ),
      };

      if (isEdit) {
        await updateGoodsIssue(id!, cleanedData);
        showSuccessToast("Stock Issue berhasil diperbarui");
      } else {
        await createGoodsIssue(cleanedData);
        showSuccessToast("Stock Issue berhasil dibuat");
      }
    } catch (err: any) {
      showErrorToast(err.message || "Gagal menyimpan Stock Issue");
    } finally {
      setLoading(false);
    }
  };

  const resetSourceLocation = (index: number) => {
    methods.setValue(`items.${index}.source_location_id`, "");
    methods.setValue(`items.${index}.source_location_name`, "");
    methods.setValue(`items.${index}.max_qty`, 0);
  };

  const resetMaxQty = (index: number) => {
    methods.setValue(`items.${index}.max_qty`, 0);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full p-4">
        <h1 className="text-xl font-bold">
          {isEdit ? "Edit Stock Issue" : "Tambah Stock Issue"}
        </h1>

        {/* Issue date */}
        <div>
          <label className="block">Tanggal Keluar</label>
          <input
            type="date"
            className="w-full p-2 bg-gray-800 rounded"
            {...register("issue_date")}
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block">Catatan</label>
          <textarea
            className="w-full p-2 bg-gray-800 rounded"
            {...register("notes")}
          />
        </div>

        {/* Items */}
        <div>
          <table className="table-auto border border-gray-700 border-collapse w-full">
            <thead>
              <tr>
                <th className="border border-gray-700 px-2 py-1">Item</th>
                <th className="border border-gray-700 px-2 py-1">
                  Dari Lokasi
                </th>
                <th className="border border-gray-700 px-2 py-1">Ke Lokasi</th>
                <th className="border border-gray-700 px-2 py-1">Max Qty</th>
                <th className="border border-gray-700 px-2 py-1">Qty</th>
                <th className="border border-gray-700 px-2 py-1">Action</th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field, index) => (
                <tr key={field.id}>
                  {/* Item */}
                  <td className="border border-gray-700 px-2 py-1">
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

                              if (!val) resetSourceLocation(index);
                            }}
                            fetchOptions={handleSearchItem}
                          />
                        );
                      }}
                    />
                  </td>

                  {/* Source Location */}
                  <td className="border border-gray-700 px-2 py-1">
                    <Controller
                      name={`items.${index}.source_location_id`}
                      control={control}
                      render={({ field }) => {
                        const currentName = methods.watch(
                          `items.${index}.source_location_name`
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
                                `items.${index}.source_location_name`,
                                val?.name || ""
                              );

                              if (val?.data?.qty !== undefined) {
                                methods.setValue(
                                  `items.${index}.max_qty`,
                                  val.data.qty
                                );
                              }

                              if (!val) resetMaxQty(index);
                            }}
                            fetchOptions={(val) =>
                              handleSearchLocation(val, index)
                            }
                          />
                        );
                      }}
                    />

                    {typeof errors.items?.[index]?.source_location_id
                      ?.message === "string" && (
                      <p className="text-red-500 text-sm">
                        {errors.items[index]?.source_location_id?.message}
                      </p>
                    )}
                  </td>

                  {/* Target Location */}
                  <td className="border border-gray-700 px-2 py-1">
                    <Controller
                      name={`items.${index}.target_location_id`}
                      control={control}
                      render={({ field }) => {
                        const currentName = methods.watch(
                          `items.${index}.target_location_name`
                        );

                        return (
                          <SearchSelect
                            value={
                              field.value
                                ? { id: field.value, name: currentName || "" }
                                : null
                            }
                            onChange={(val) => {
                              field.onChange(val?.id || null);
                              methods.setValue(
                                `items.${index}.target_location_name`,
                                val?.name || ""
                              );
                            }}
                            fetchOptions={handleTargetLocation}
                          />
                        );
                      }}
                    />

                    {typeof errors.items?.[index]?.target_location_id
                      ?.message === "string" && (
                      <p className="text-red-500 text-sm">
                        {errors.items[index]?.target_location_id?.message}
                      </p>
                    )}
                  </td>

                  {/* MAX QTY */}
                  <td className="border border-gray-700 px-2 py-1">
                    <input
                      type="number"
                      disabled
                      placeholder="Max Qty"
                      readOnly
                      className="w-24 p-2 bg-gray-800 rounded"
                      {...register(`items.${index}.max_qty`, {
                        valueAsNumber: true,
                      })}
                    />

                    {typeof errors.items?.[index]?.max_qty?.message ===
                      "string" && (
                      <p className="text-red-500 text-sm">
                        {errors.items[index]?.max_qty?.message}
                      </p>
                    )}
                  </td>

                  {/* Quantity */}
                  <td className="border border-gray-700 px-2 py-1">
                    <input
                      type="number"
                      placeholder="Qty"
                      className="w-24 p-2 bg-gray-800 rounded"
                      {...register(`items.${index}.quantity`, {
                        valueAsNumber: true,
                      })}
                    />

                    {typeof errors.items?.[index]?.quantity?.message ===
                      "string" && (
                      <p className="text-red-500 text-sm">
                        {errors.items[index]?.quantity?.message}
                      </p>
                    )}
                  </td>

                  {/* Action */}
                  <td className="border border-gray-700 px-2 py-1">
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="px-2 py-1 bg-red-600 text-white rounded"
                    >
                      Hapus
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
                        source_location_id: "",
                        target_location_id: null,
                        quantity: 1,
                        max_qty: 0,
                        notes: "",
                      })
                    }
                    className="px-3 py-1 bg-green-600 text-white rounded"
                  >
                    + Tambah Item
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 rounded text-white"
        >
          {loading ? "Menyimpan..." : "Simpan"}
        </button>
      </form>
    </FormProvider>
  );
}
