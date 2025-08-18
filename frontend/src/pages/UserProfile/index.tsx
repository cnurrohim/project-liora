import { useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { showSuccessToast } from "@/utils/toast";
import ForbiddenPage from "pages/Misc/403";
import { getUserProfile, updateUserProfile } from "./userProfile.api";
import { usePermissions } from "./permissions";
import { ProfileController } from "@/controller/ProfileController";
import { API_URL } from "@/constants/common";

// --- Zod schema ---
export const userProfileSchema = z
  .object({
    name: z.string().min(1, "Nama lengkap wajib diisi"),
    username: z.string().min(3, "Username minimal 3 karakter"),
    email: z.string().email("Email tidak valid"),
    phone_number: z.string().optional(),
    address: z.string().optional(),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
    profile_photo: z
      .any()
      .refine(
        (file) =>
          !file || ["image/jpeg", "image/png", "image/jpg"].includes(file.type),
        { message: "Hanya file JPG/PNG yang diperbolehkan" }
      )
      .optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password dan konfirmasi harus sama",
    path: ["confirmPassword"],
  });

export type UserProfileForm = z.infer<typeof userProfileSchema>;

export default function UserProfilePage() {
  const { canView, canSubmit } = usePermissions();
  if (!canView) return <ForbiddenPage />;

  const methods = useForm<UserProfileForm>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      phone_number: "",
      password: "",
      address: "",
      profile_photo: "",
      confirmPassword: "",
    },
  });

  const {
    control,
    register,
    setValue,
    setError,
    formState: { errors },
  } = methods;

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getUserProfile().then((data) => {
      setValue("name", data.name ?? "");
      setValue("username", data.username ?? "");
      setValue("email", data.email ?? "");
      setValue("phone_number", data.phone_number ?? "");
      setValue("address", data.address ?? "");
      if (data.profile_photo) {
        setPreviewUrl(`${API_URL}${data.profile_photo}`);
      }
    });
  }, [setValue]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);

    const formValues = {
      name: (control._formValues.name as string) ?? "",
      username: (control._formValues.username as string) ?? "",
      email: (control._formValues.email as string) ?? "",
      phone_number: (control._formValues.phone_number as string) ?? "",
      address: (control._formValues.address as string) ?? "",
      password: (control._formValues.password as string) ?? undefined,
      confirmPassword:
        (control._formValues.confirmPassword as string) ?? undefined,
      profile_photo: control._formValues.profile_photo as File | undefined,
    };

    try {
      userProfileSchema.parse(formValues);
    } catch (err: any) {
      alert(err.errors?.[0]?.message || "Validasi gagal");
      setLoading(false);
      return;
    }

    try {
      const result = await updateUserProfile(formValues);

      if (result.success) {
        showSuccessToast("Profil berhasil diperbarui");
        await ProfileController.load();
      }
    } catch (err: any) {
      if (err.response?.status === 409) {
        setError("username", {
          type: "manual",
          message: err.response.data?.message || "Username sudah digunakan",
        });
      } else {
        console.error(err);
      }
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <div>
        <label className="block text-sm font-medium mb-1">Foto Profil</label>
        <Controller
          name="profile_photo"
          control={control}
          render={({ field }) => (
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  field.onChange(file);
                  if (file) setPreviewUrl(URL.createObjectURL(file));
                }}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-gray-700 file:text-gray-200
                  hover:file:bg-gray-900
                  cursor-pointer"
              />
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Profile Preview"
                  className="h-20 w-20 rounded-full object-cover"
                />
              )}
            </div>
          )}
        />

        {errors.profile_photo?.message && (
          <p className="text-blue-400 text-sm mt-1">
            {String(errors.profile_photo.message)}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
        <input
          type="text"
          {...register("name")}
          className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
        />
        {errors.name && (
          <p className="text-blue-400 text-sm mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Username</label>
        <input
          type="text"
          {...register("username")}
          className="w-full border-gray-300 rounded-md shadow-sm p-2"
        />
        {errors.username?.message && (
          <p className="text-blue-400 text-sm mt-1">
            {errors.username.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Password Baru</label>
        <input
          type="password"
          {...register("password")}
          placeholder="Kosongkan jika tidak ingin mengganti"
          className="w-full border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Konfirmasi Password
        </label>
        <input
          type="password"
          {...register("confirmPassword")}
          placeholder="Ulangi password baru"
          className="w-full border-gray-300 rounded-md shadow-sm p-2"
        />
        {errors.confirmPassword && (
          <p className="text-blue-400 text-sm mt-1">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          {...register("email")}
          className="w-full border-gray-300 rounded-md shadow-sm p-2"
        />
        {errors.email && (
          <p className="text-blue-400 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">No. HP</label>
        <input
          type="tel"
          {...register("phone_number")}
          className="w-full border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Alamat</label>
        <textarea
          {...register("address")}
          className="w-full border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>

      {canSubmit && (
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Menyimpan..." : "Simpan"}
        </button>
      )}
    </form>
  );
}
