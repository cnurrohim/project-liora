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
import { searchItemsByLocationId, searchLocation } from "@/api/search.api";
import SearchSelect from "@/components/SelectOptions/searchSelect";
import {
  createStockOpname,
  updateStockOpname,
  getStockOpnameById,
} from "./stockOpname.api";

export default function StockOpnameFormPage() {
  const { canView, canUpdate, canCreate, canReview } = usePermissions();
  if (!canView) return <ForbiddenPage />;

  const { id: editId } = useRouteParamsFromTab("/stock-opname/:id/edit");
  const { id: reviewId } = useRouteParamsFromTab("/stock-opname/:id/review");
  const submitLabelReview = reviewId && "Review";
  const submitLabelEdit = editId && "Update";
  const submitLabel = submitLabelEdit || submitLabelReview || "Simpan";

  const id = editId || reviewId;
  const isEdit = !!editId;
  const isReview = !!reviewId;

  const [loading, setLoading] = useState(false);

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
      if (isEdit || (isReview && id)) {
        const so = await getStockOpnameById(id);

        reset({
          opname_date: so.opname_date ? so.opname_date.substring(0, 10) : "",
          notes: so.notes ?? "",
          review_note: so.review_note ?? "",
          status: isReview ? "reviewed" : so.status ?? "draft",
          location_id: so.location_id,
          location_name: so.location_name,
          items: so.items ?? [],
        });
      }
    };
    init();
  }, [isEdit, isReview, id, reset]);

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
      showErrorToast("Gagal mencari item");
      return [];
    }
  };

  const handleSearchLocation = async (keyword: string) => {
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

  const onSubmit = async (data: StockOpnameFormValues) => {
    if (isEdit && !canUpdate) {
      showErrorToast("Anda tidak punya hak akses untuk update!");
      return;
    }

    if (isReview && !canReview) {
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
        items: data.items.map(({ item_name, ...rest }) => rest),
      };

      if (isEdit || isReview) {
        await updateStockOpname(id!, cleanedData);
        const messageEdit = "Stock Opname berhasil diperbarui";
        const messageReview = "Stock Opname berhasil direview";
        const successMessage = isEdit ? messageEdit : messageReview;
        showSuccessToast(successMessage);
      } else {
        await createStockOpname(cleanedData);
        showSuccessToast("Stock Opname berhasil dibuat");
      }
    } catch (err: any) {
      showErrorToast(err.message || "Gagal menyimpan Stock Opname");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full p-4">
        <h1 className="text-xl font-bold">
          {isEdit
            ? "Edit Stock Opname"
            : isReview
            ? "Review Stock Opname"
            : "Tambah Stock Opname"}
        </h1>

        {/* Opname Date */}
        <div>
          <label className="block">Tanggal Opname</label>
          <Controller
            name="opname_date"
            control={control}
            render={({ field }) => (
              <input
                type="date"
                className="w-full p-2 bg-gray-800 rounded"
                {...field}
              />
            )}
          />
          {errors.opname_date && (
            <p className="text-red-500 text-sm">{errors.opname_date.message}</p>
          )}
        </div>

        {/** LOKASI OPNAME */}
        <div>
          <label className="block">Lokasi Opname</label>
          <Controller
            name={`location_id`}
            control={control}
            render={({ field }) => {
              const currentName = methods.watch(`location_name`);
              return (
                <SearchSelect
                  value={
                    field.value
                      ? { id: field.value, name: currentName || "" }
                      : null
                  }
                  onChange={(val) => {
                    field.onChange(val?.id || "");
                    methods.setValue(`location_name`, val?.name || "");

                    // Reset semua items kalau lokasi dihapus / diganti
                    methods.setValue("items", []);
                  }}
                  fetchOptions={(val) => handleSearchLocation(val)}
                />
              );
            }}
          />

          {typeof errors.location_id?.message === "string" && (
            <p className="text-red-500 text-sm">{errors.location_id.message}</p>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block">Catatan</label>
          <Controller
            name="notes"
            control={control}
            render={({ field }) => (
              <textarea
                readOnly={isReview}
                className="w-full p-2 bg-gray-800 rounded"
                {...field}
                value={field.value ?? ""}
              />
            )}
          />

          {errors.notes && (
            <p className="text-red-500 text-sm">{errors.notes.message}</p>
          )}
        </div>

        {/* Review Notes */}
        {id && (
          <div>
            <label className="block">Review Note</label>
            <Controller
              name="review_note"
              control={control}
              render={({ field }) => (
                <textarea
                  readOnly={isEdit}
                  className="w-full p-2 bg-gray-800 rounded"
                  {...field}
                  value={field.value ?? ""}
                />
              )}
            />

            {errors.review_note && (
              <p className="text-red-500 text-sm">
                {errors.review_note.message}
              </p>
            )}
          </div>
        )}

        {/* Items */}
        <div>
          <table className="table-auto border border-gray-700 border-collapse w-full">
            <thead>
              <tr>
                <th className="border border-gray-700 px-2 py-1">Item</th>
                <th className="border border-gray-700 px-2 py-1">Qty System</th>
                <th className="border border-gray-700 px-2 py-1">
                  Qty Counted
                </th>
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
                                  "Pilih lokasi terlebih dahulu .."
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
                      <p className="text-red-500 text-sm">
                        {errors.items[index]?.item_id?.message}
                      </p>
                    )}
                  </td>

                  {/* Qty System */}
                  <td className="border border-gray-700 px-2 py-1">
                    <Controller
                      name={`items.${index}.quantity_system`}
                      control={control}
                      render={({ field }) => (
                        <input
                          type="number"
                          disabled
                          readOnly
                          className="w-24 p-2 bg-gray-800 rounded"
                          {...field}
                          value={field.value ?? 0}
                        />
                      )}
                    />
                  </td>

                  {/* Qty Counted */}
                  <td className="border border-gray-700 px-2 py-1">
                    <Controller
                      name={`items.${index}.quantity_counted`}
                      control={control}
                      render={({ field }) => (
                        <input
                          type="string"
                          inputMode="numeric"
                          className="w-24 p-2 bg-gray-800 rounded"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value) || 0)
                          }
                        />
                      )}
                    />
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
          {loading ? "Menyimpan..." : submitLabel}
        </button>
      </form>
    </FormProvider>
  );
}
