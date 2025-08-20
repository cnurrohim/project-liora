// src/routes/PurchaseOrderFormPage.tsx
import {
  Controller,
  FormProvider,
  useForm,
  useFieldArray,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createPurchaseOrder,
  getPurchaseOrderById,
  updatePurchaseOrder,
} from "./purchaseOrder.api";
import { useEffect, useState } from "react";
import { useRouteParamsFromTab } from "@/hooks/useRouteParams";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import ForbiddenPage from "pages/Misc/403";
import { usePermissions } from "./permissions";
import {
  purchaseOrderSchema,
  type PurchaseOrderFormValues,
} from "./formSchema";
import SingleSelect from "@/components/SelectOptions/SingleSelect";
import { getSuppliers } from "../Supplier/supplier.api";
import { getItems } from "../Item/item.api";

type Option = {
  id: string;
  name: string;
};

export default function PurchaseOrderFormPage() {
  const { canView, canUpdate, canCreate } = usePermissions();
  if (!canView) return <ForbiddenPage />;

  const { id } = useRouteParamsFromTab("/purchase-orders/:id/edit");
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);

  const [allSuppliers, setAllSuppliers] = useState<Option[]>([]);
  const [allItems, setAllItems] = useState<Option[]>([]);

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const methods = useForm<PurchaseOrderFormValues>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: {
      supplier_id: "",
      order_date: today.toISOString().substring(0, 10), // hari ini
      expected_date: tomorrow.toISOString().substring(0, 10), // besok
      status: "draft",
      notes: "",
      items: [], // <--- penting
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
      setAllSuppliers(suppliers.map((p: any) => ({ id: p.id, name: p.name })));

      const items = await getItems();
      setAllItems(
        items.map((i: any) => ({ id: i.id, name: `${i.sku} - ${i.name}` }))
      );

      if (isEdit && id) {
        const po = await getPurchaseOrderById(id);
        reset({
          supplier_id: po.supplier_id,
          order_date: po.order_date,
          expected_date: po.expected_date ?? null,
          status: po.status,
          notes: po.notes ?? "",
          items: po.items ?? [],
        });
      }
    };

    init();
  }, [isEdit, id, reset]);

  const onSubmit = async (data: PurchaseOrderFormValues) => {
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
        await updatePurchaseOrder(id!, data);
        showSuccessToast("Purchase Order berhasil diperbarui");
      } else {
        await createPurchaseOrder(data);
        showSuccessToast("Purchase Order berhasil dibuat");
      }
    } catch (err: any) {
      showErrorToast(err.message || "Gagal menyimpan purchase order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full p-4">
        <h1 className="text-xl font-bold">
          {isEdit ? "Edit Purchase Order" : "Tambah Purchase Order"}
        </h1>

        <div className="space-y-4 max-w-xl p-4">
          {/* Supplier */}
          <div>
            <label className="block">Supplier</label>
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
                  placeholder="Pilih Supplier"
                />
              )}
            />
            {typeof errors.supplier_id?.message === "string" && (
              <p className="text-red-500 text-sm">
                {errors.supplier_id.message}
              </p>
            )}
          </div>

          {/* Order date */}
          <div>
            <label className="block">Tanggal Order</label>
            <input
              type="date"
              className="w-full p-2 bg-gray-800 rounded"
              {...register("order_date")}
            />
          </div>

          {/* Expected date */}
          <div>
            <label className="block">Tanggal Perkiraan Datang</label>
            <input
              type="date"
              className="w-full p-2 bg-gray-800 rounded"
              {...register("expected_date")}
            />
          </div>

          {/* Status */}
          <div>
            <label className="block">Status</label>
            <select
              className="w-full p-2 bg-gray-800 rounded"
              {...register("status")}
            >
              <option value="draft">Draft</option>
              <option value="confirmed">confirmed</option>
              <option value="received">Received</option>
              <option value="cancelled">Cancelled</option>
            </select>
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
                  <th className="border border-gray-700 px-2 py-1">Price</th>
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
                        className="w-20 p-2 bg-gray-800 rounded"
                        {...register(`items.${index}.qty`, {
                          valueAsNumber: true,
                        })}
                      />
                    </td>
                    <td className="border border-gray-700 px-2 py-1">
                      <input
                        type="number"
                        placeholder="Harga"
                        className="w-32 p-2 bg-gray-800 rounded"
                        {...register(`items.${index}.price`, {
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
                  <td className="text-center">
                    <button
                      type="button"
                      onClick={() => append({ item_id: "", qty: 1, price: 0 })}
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
