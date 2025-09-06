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
} from "@/pages/Inventory/Supplier/formSchema";
import { BackToListLink } from "@/components/Buttons/BackToListLink";

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
        await updateSupplier(id!, data);
        showSuccessToast("Supplier berhasil diperbarui");
      } else {
        await createSupplier(data);
        showSuccessToast("Supplier berhasil dibuat");
      }
    } catch (err: any) {
      showErrorToast(err.message || "Gagal Saving supplier");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 max-w-3/4 mx-auto w-full p-4"
      >
        <BackToListLink
          route="/pages/inventory/supplier"
          label="list suppliers"
        />
        <h1 className="text-xl font-bold">
          {isEdit ? "Edit Supplier" : "Add New Supplier"}
        </h1>

        <div className="space-y-4">
          <div>
            <label className="block text-[var(--text-muted)]">
              Supplier Name
            </label>
            <input
              className="w-full p-2 bg-[var(--background)] rounded"
              {...register("name")}
            />
            {typeof errors.name?.message === "string" && (
              <p className="text-[var(--danger)] text-sm">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-[var(--text-muted)]">Contact</label>
            <input
              className="w-full p-2 bg-[var(--background)] rounded"
              {...register("contact")}
            />
            {typeof errors.contact?.message === "string" && (
              <p className="text-[var(--danger)] text-sm">
                {errors.contact.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-[var(--text-muted)]">Address</label>
            <textarea
              className="w-full p-2 bg-[var(--background)] rounded"
              {...register("address")}
            />
            {typeof errors.address?.message === "string" && (
              <p className="text-[var(--danger)] text-sm">
                {errors.address.message}
              </p>
            )}
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
