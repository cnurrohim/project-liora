import { apiFetch } from "@/utils/apiFetch";

export async function getUserProfile() {
  const res = await apiFetch("/profile/me", { method: "GET" });
  if (!res.ok) throw new Error("Gagal mengambil profile user");
  return (await res.json()).user;
}
