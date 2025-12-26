import { apiFetch } from "@/utils/apiFetch";

export async function login({
  username,
  password,
}: {
  username: string;
  password: string;
}) {
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error?.error || "Login failed");
  }

  // ✅ Ini bagian penting: parse response jadi object
  const data = await res.json();

  // Harus mengandung { token, refreshToken, user }
  return data;
}

export async function loginDemo({ role }: { role: "admin" | "staff" | "dev" }) {
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  console.log(API_URL);

  const res = await fetch(`${API_URL}/auth/demo-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ role }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error?.error || "Demo Login failed");
  }

  // ✅ Ini bagian penting: parse response jadi object
  const data = await res.json();

  // Harus mengandung { token, refreshToken, user }
  return data;
}

export async function switchRoleAPI(roleId: string) {
  const res = await apiFetch("/auth/switch-role", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ roleId }),
  });

  if (!res.ok) throw new Error("Failed to switch role");

  return await res.json();
}
