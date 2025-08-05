// src/utils/apiFetch.ts
const API_URL = import.meta.env.VITE_API_BASE_URL;

export async function apiFetch(
  url: string,
  options: RequestInit = {},
  retry = true
): Promise<Response> {
  const token = localStorage.getItem("token");

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    ...normalizeHeaders(options.headers),
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_URL}${url}`, { ...options, headers });

  if (response.status === 401 && retry) {
    try {
      const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (refreshRes.ok) {
        const { token: newToken } = await refreshRes.json();
        localStorage.setItem("token", newToken);

        return apiFetch(url, options, false); // Retry sekali lagi
      } else {
        localStorage.clear();
        window.location.href = "/login";
      }
    } catch (e) {
      console.error("Gagal refresh token:", e);
      localStorage.clear();
      window.location.href = "/login";
    }
  }

  return response;
}

function normalizeHeaders(headers?: HeadersInit): Record<string, string> {
  if (!headers) return {};
  if (headers instanceof Headers) {
    return Object.fromEntries(headers.entries());
  }
  if (Array.isArray(headers)) {
    return Object.fromEntries(headers); // array of [key, value]
  }
  return headers; // assumed to be Record<string, string>
}
