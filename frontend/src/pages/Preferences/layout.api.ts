import { apiFetch } from "@/utils/apiFetch";

export async function getLayout(userId: string, roleId: string) {
  const res = await apiFetch(`/user-layout/${userId}/${roleId}`);
  if (!res.ok) throw new Error("Gagal mengambil layout user");
  return (await res.json()).layout;
}

export async function saveLayout(
  userId: string,
  roleId: string,
  layout: Record<string, unknown>,
  config: Record<string, unknown>
) {
  const res = await apiFetch("/user-layout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user_id: userId, role_id: roleId, layout, config }),
  });
  if (!res.ok) throw new Error("Gagal Saving layout user");
  return (await res.json()).data;
}
