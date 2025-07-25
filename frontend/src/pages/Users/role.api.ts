import { apiFetch } from "../../utils/apiFetch";

export async function getRoles(): Promise<{ id: string; name: string }[]> {
  const res = await apiFetch("/roles");
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err?.error || "Gagal mengambil data roles");
  }

  const data = await res.json();
  return data.roles; // pastikan response backend: { roles: [...] }
}
