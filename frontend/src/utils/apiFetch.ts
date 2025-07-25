// src/utils/apiFetch.ts
const API_URL = import.meta.env.VITE_API_BASE_URL;

export async function apiFetch(
  url: string,
  options: RequestInit = {},
  retry = true
): Promise<Response> {
  const token = localStorage.getItem("token");

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const response = await fetch(`${API_URL}${url}`, { ...options, headers });

  if (response.status === 401 && retry) {
    // Coba refresh token
    const refresh = localStorage.getItem("refreshToken");

    if (refresh) {
      const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${refresh}`,
          "Content-Type": "application/json",
        },
      });

      if (refreshRes.ok) {
        const { token: newToken } = await refreshRes.json();
        localStorage.setItem("token", newToken);

        // Retry original request sekali lagi
        return apiFetch(`${API_URL}${url}`, options, false);
      } else {
        // Refresh gagal → logout user
        localStorage.clear();
        window.location.href = "/login";
      }
    }
  }

  return response;
}
