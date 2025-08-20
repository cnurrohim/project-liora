// src/routes/ItemFormPage.tsx
import { Controller, FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createItem, getItemById, updateItem } from "./item.api";
import { useEffect, useState } from "react";
import { useRouteParamsFromTab } from "@/hooks/useRouteParams";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import ForbiddenPage from "pages/Misc/403";
import { usePermissions } from "./permissions";
import { itemSchema, type ItemFormValues } from "./formSchema";
import SingleSelect from "@/components/SelectOptions/SingleSelect";
import { getLocations } from "../Location/location.api";
import { getSuppliers } from "../Supplier/supplier.api";

type Option = {
  id: string;
  name: string;
};

export default function ItemFormPage() {
  const { canView, canUpdate, canCreate } = usePermissions();

  if (!canView) return <ForbiddenPage />;

  const { id } = useRouteParamsFromTab("/items/:id/edit");
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);

  const [allLocations, setAllLocations] = useState<Option[]>([]);
  const [allSuppliers, setAllSuppliers] = useState<Option[]>([]);

  const methods = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      sku: "",
      name: "",
      min_stock: 0,
      location_id: null,
      supplier_id: null,
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
      const locations = await getLocations(); // <-- Kamu buat di `menu.api.ts`
      setAllLocations(
        locations.map((p: any) => ({
          id: p.id,
          name: `${p.code}`,
        }))
      );

      const suppliers = await getSuppliers(); // <-- Kamu buat di `menu.api.ts`
      setAllSuppliers(
        suppliers.map((p: any) => ({
          id: p.id,
          name: `${p.name}`,
        }))
      );

      if (isEdit && id) {
        getItemById(id).then((item) => {
          reset({
            sku: item.sku,
            name: item.name,
            min_stock: item.min_stock ?? 0,
            location_id: item.location_id ?? null,
            supplier_id: item.supplier_id ?? null,
          });
        });
      }
    };

    init();
  }, [isEdit, id, reset]);

  const onSubmit = async (data: ItemFormValues) => {
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
        await updateItem(id!, data);
        showSuccessToast("Barang berhasil diperbarui");
      } else {
        await createItem(data);
        showSuccessToast("Barang berhasil dibuat");
      }
    } catch (err: any) {
      showErrorToast(err.message || "Gagal menyimpan barang");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full p-4">
        <h1 className="text-xl font-bold">
          {isEdit ? "Edit Barang" : "Tambah Barang"}
        </h1>

        <div className="space-y-4 max-w-xl p-4">
          <div>
            <label className="block">SKU</label>
            <input
              className="w-full p-2 bg-gray-800 rounded"
              {...register("sku")}
            />
            {typeof errors.sku?.message === "string" && (
              <p className="text-red-500 text-sm">{errors.sku.message}</p>
            )}
          </div>

          <div>
            <label className="block">Nama Barang</label>
            <input
              className="w-full p-2 bg-gray-800 rounded"
              {...register("name")}
            />
            {typeof errors.name?.message === "string" && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block">Minimal Stok</label>
            <input
              type="number"
              className="w-full p-2 bg-gray-800 rounded"
              {...register("min_stock", { valueAsNumber: true })}
            />
            {typeof errors.min_stock?.message === "string" && (
              <p className="text-red-500 text-sm">{errors.min_stock.message}</p>
            )}
          </div>

          <div>
            <label className="block">Rak Penyimpanan</label>
            <Controller
              name="location_id"
              control={methods.control}
              render={({ field }) => (
                <SingleSelect
                  options={allLocations}
                  value={
                    allLocations.find((opt) => opt.id === field.value) ?? null
                  }
                  onChange={(val) => field.onChange(val ? val.id : null)}
                  placeholder="Pilih lokasi"
                />
              )}
            />
            {typeof errors.location_id?.message === "string" && (
              <p className="text-red-500 text-sm">
                {errors.location_id.message}
              </p>
            )}
          </div>

          <div>
            <label className="block">ID Supplier</label>
            <Controller
              name="supplier_id"
              control={methods.control}
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
