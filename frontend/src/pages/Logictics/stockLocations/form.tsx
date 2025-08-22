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
        await updateStockLocation(id!, data);
        showSuccessToast("Lokasi berhasil diperbarui");
      } else {
        await createStockLocation(data);
        showSuccessToast("Lokasi berhasil dibuat");
      }
    } catch (err: any) {
      showErrorToast(err.message || "Gagal menyimpan lokasi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full p-4">
        <h1 className="text-xl font-bold">
          {isEdit ? "Edit Lokasi" : "Tambah Lokasi"}
        </h1>

        <div className="space-y-4 max-w-xl p-4">
          <div>
            <label className="block">Kode Lokasi</label>
            <input
              className="w-full p-2 bg-gray-800 rounded"
              {...register("code")}
            />
            {errors.code?.message && (
              <p className="text-red-500 text-sm">{errors.code.message}</p>
            )}
          </div>

          <div>
            <label className="block">Nama Lokasi</label>
            <input
              className="w-full p-2 bg-gray-800 rounded"
              {...register("name")}
            />
            {errors.name?.message && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block">Tipe Lokasi</label>
            <select
              className="w-full p-2 bg-gray-800 rounded"
              {...register("type")}
            >
              <option value="">Pilih tipe</option>
              <option value="warehouse">Warehouse</option>
              <option value="store_display">Store Display</option>
              <option value="front_desk">Front Desk</option>
              <option value="cold_storage">Cold Storage</option>
              <option value="shipping_container">Shipping Container</option>
            </select>
            {errors.type?.message && (
              <p className="text-red-500 text-sm">{errors.type.message}</p>
            )}
          </div>

          <div>
            <label className="block">Deskripsi</label>
            <textarea
              className="w-full p-2 bg-gray-800 rounded"
              {...register("description")}
            />
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
