export function getToken(): string | null {
  return localStorage.getItem("token");
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export async function logout() {
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  try {
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch (error) {
    console.error("Logout failed:", error);
  } finally {
    localStorage.clear();
    window.location.replace("/login");
  }
}

export function getUserPermissions(): string[] {
  try {
    const user = JSON.parse(localStorage.getItem("user") ?? "null");
    return Array.isArray(user?.permissions) ? user.permissions : [];
  } catch {
    return [];
  }
}
