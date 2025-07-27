import { apiFetch } from "../../utils/apiFetch";

export async function getLayout(userId: string, roleId: string) {
  const res = await apiFetch(
    `/user-layout?user_id=${userId}&role_id=${roleId}`
  );
  if (!res.ok) throw new Error("Gagal mengambil layout user");
  return (await res.json()).layout;
}

export async function saveLayout(
  userId: string,
  roleId: string,
  layout: Record<string, unknown>
) {
  const res = await apiFetch("/user-layout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user_id: userId, role_id: roleId, layout }),
  });
  if (!res.ok) throw new Error("Gagal menyimpan layout user");
  return (await res.json()).data;
}
