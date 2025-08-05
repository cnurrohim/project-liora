export function getToken(): string | null {
  return localStorage.getItem("token");
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export async function logout() {
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  try {
    const res = await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error?.error || "Login failed");
    }
  } catch (error) {
    console.error("Gagal refresh token:", error);
  }

  localStorage.clear();
  window.location.href = "/login";
}
