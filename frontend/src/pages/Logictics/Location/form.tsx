import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { locationSchema, type LocationFormValues } from "./formSchema";
import {
  createLocation,
  getLocationById,
  updateLocation,
} from "./location.api";
import { useEffect, useState } from "react";
import { useRouteParamsFromTab } from "@/hooks/useRouteParams";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import ForbiddenPage from "pages/Misc/403";
import { usePermissions } from "./permissions";

export default function LocationFormPage() {
  const { canView, canUpdate, canCreate } = usePermissions();

  if (!canView) return <ForbiddenPage />;

  const { id } = useRouteParamsFromTab("/locations/:id/edit");
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);

  const methods = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      code: "",
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
      getLocationById(id).then((loc) => {
        reset({
          code: loc.code,
          description: loc.description,
        });
      });
    }
  }, [isEdit, id, reset]);

  const onSubmit = async (data: LocationFormValues) => {
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
        await updateLocation(id!, data);
        showSuccessToast("Lokasi berhasil diperbarui");
      } else {
        await createLocation(data);
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
            {typeof errors.code?.message === "string" && (
              <p className="text-red-500 text-sm">{errors.code.message}</p>
            )}
          </div>

          <div>
            <label className="block">Deskripsi</label>
            <textarea
              className="w-full p-2 bg-gray-800 rounded"
              {...register("description")}
            />
            {typeof errors.description?.message === "string" && (
              <p className="text-red-500 text-sm">
                {errors.description.message}
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
