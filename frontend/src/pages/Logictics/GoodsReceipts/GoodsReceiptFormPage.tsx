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

  const today = new Date();

  const methods = useForm<GoodsReceiptFormValues>({
    resolver: zodResolver(goodsReceiptSchema),
    defaultValues: {
      supplier_id: "",
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
          receipt_date: gr.receipt_date,
          notes: gr.notes ?? "",
          items: gr.items ?? [],
        });
      }
    };

    init();
  }, [isEdit, id, reset]);

  const onSubmit = async (data: GoodsReceiptFormValues) => {
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
      if (isEdit) {
        await updateGoodsReceipt(id!, data);
        showSuccessToast("Goods Receipt berhasil diperbarui");
      } else {
        await createGoodsReceipt(data);
        showSuccessToast("Goods Receipt berhasil dibuat");
      }
    } catch (err: any) {
      showErrorToast(err.message || "Gagal menyimpan goods receipt");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full p-4">
        <h1 className="text-xl font-bold">
          {isEdit ? "Edit Goods Receipt" : "Tambah Goods Receipt"}
        </h1>

        <div className="space-y-4 max-w-xl p-4">
          {/* Supplier */}
          <div>
            <label className="block">Supplier (opsional)</label>
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
              <p className="text-red-500 text-sm">
                {errors.supplier_id.message}
              </p>
            )}
          </div>

          {/* Receipt date */}
          <div>
            <label className="block">Tanggal Penerimaan</label>
            <input
              type="date"
              className="w-full p-2 bg-gray-800 rounded"
              {...register("receipt_date")}
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
                  <th className="border border-gray-700 px-2 py-1">Items</th>
                  <th className="border border-gray-700 px-2 py-1">Qty</th>
                  <th className="border border-gray-700 px-2 py-1">Action</th>
                </tr>
              </thead>
              <tbody>
                {fields.map((field, index) => (
                  <tr key={field.id}>
                    <td className="border border-gray-700 px-2 py-1">
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
                    <td className="border border-gray-700 px-2 py-1">
                      <input
                        type="number"
                        placeholder="Qty"
                        className="w-24 p-2 bg-gray-800 rounded"
                        {...register(`items.${index}.quantity`, {
                          valueAsNumber: true,
                        })}
                      />
                    </td>
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
                  <td colSpan={3} className="text-center">
                    <button
                      type="button"
                      onClick={() =>
                        append({ item_id: "", quantity: 1, notes: "" })
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
