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
