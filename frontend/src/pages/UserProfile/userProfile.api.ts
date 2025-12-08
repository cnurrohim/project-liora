import { apiFetch } from "@/utils/apiFetch";

export type UserProfile = {
  id: string;
  name: string;
  username: string;
  email: string;
  phone_number?: string | null;
  address?: string | null;
  profile_photo?: string | null; // filename
  password?: string; // filename
};

export async function getUserProfile(): Promise<UserProfile> {
  const res = await apiFetch("/profile", { method: "GET" });
  if (!res.ok) throw new Error("Gagal mengambil profile user");
  return (await res.json()).user;
}

export async function updateUserProfile(payload: {
  name?: string;
  email?: string;
  phone_number?: string;
  username?: string;
  address?: string;
  password?: string;
  profile_photo?: File;
}): Promise<{ success: boolean; filename?: string }> {
  const formData = new FormData();

  if (payload.username !== undefined)
    formData.append("username", payload.username);
  if (payload.password !== undefined)
    formData.append("password", payload.password);
  if (payload.name !== undefined) formData.append("name", payload.name);
  if (payload.email !== undefined) formData.append("email", payload.email);
  if (payload.phone_number !== undefined)
    formData.append("phone_number", payload.phone_number);
  if (payload.address !== undefined)
    formData.append("address", payload.address);
  if (payload.profile_photo) {
    formData.append("profile_photo", payload.profile_photo);
  }

  const res = await apiFetch("/profile", {
    method: "PUT",
    body: formData,
  });
  if (!res.ok) throw new Error("Gagal mengupdate profile user");
  return await res.json();
}
