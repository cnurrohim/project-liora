import { apiFetch } from "@/utils/apiFetch";

// Ambil layout dashboard user
export async function getDashboardLayout(userId: string, roleId: string) {
  const res = await apiFetch(`/user-dashboard/${userId}/${roleId}`);
  if (!res.ok) throw new Error("Gagal mengambil layout dashboard user");
  return (await res.json()).layout;
}

// Simpan (insert/update) layout dashboard user
export async function saveDashboardLayout(
  userId: string,
  roleId: string,
  layout: Record<string, unknown>
) {
  const res = await apiFetch("/user-dashboard", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user_id: userId, role_id: roleId, layout }),
  });
  if (!res.ok) throw new Error("Gagal menyimpan layout dashboard user");
  return await res.json();
}
