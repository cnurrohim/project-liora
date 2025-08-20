// src/routes/SupplierFormPage.tsx
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createSupplier,
  getSupplierById,
  updateSupplier,
} from "./supplier.api";
import { useEffect, useState } from "react";
import { useRouteParamsFromTab } from "@/hooks/useRouteParams";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import ForbiddenPage from "pages/Misc/403";
import { usePermissions } from "./permissions";
import {
  supplierSchema,
  type SupplierFormValues,
} from "@/pages/Logictics/Supplier/formSchema";

export default function SupplierFormPage() {
  const { canView, canUpdate, canCreate } = usePermissions();

  if (!canView) return <ForbiddenPage />;

  const { id } = useRouteParamsFromTab("/suppliers/:id/edit");
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);

  const methods = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: "",
      contact: "",
      address: "",
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
      getSupplierById(id).then((supplier) => {
        reset({
          name: supplier.name,
          contact: supplier.contact ?? "",
          address: supplier.address ?? "",
        });
      });
    }
  }, [isEdit, id, reset]);

  const onSubmit = async (data: SupplierFormValues) => {
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
        await updateSupplier(id!, data);
        showSuccessToast("Supplier berhasil diperbarui");
      } else {
        await createSupplier(data);
        showSuccessToast("Supplier berhasil dibuat");
      }
    } catch (err: any) {
      showErrorToast(err.message || "Gagal menyimpan supplier");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full p-4">
        <h1 className="text-xl font-bold">
          {isEdit ? "Edit Supplier" : "Tambah Supplier"}
        </h1>

        <div className="space-y-4 max-w-xl p-4">
          <div>
            <label className="block">Nama Supplier</label>
            <input
              className="w-full p-2 bg-gray-800 rounded"
              {...register("name")}
            />
            {typeof errors.name?.message === "string" && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block">Kontak</label>
            <input
              className="w-full p-2 bg-gray-800 rounded"
              {...register("contact")}
            />
            {typeof errors.contact?.message === "string" && (
              <p className="text-red-500 text-sm">{errors.contact.message}</p>
            )}
          </div>

          <div>
            <label className="block">Alamat</label>
            <textarea
              className="w-full p-2 bg-gray-800 rounded"
              {...register("address")}
            />
            {typeof errors.address?.message === "string" && (
              <p className="text-red-500 text-sm">{errors.address.message}</p>
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
