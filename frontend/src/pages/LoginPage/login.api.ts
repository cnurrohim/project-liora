export async function login({
  username,
  password,
}: {
  username: string;
  password: string;
}) {
  const res = await fetch("http://localhost:4000/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
