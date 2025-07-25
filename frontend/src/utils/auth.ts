export function getToken(): string | null {
  return localStorage.getItem("token");
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function logout() {
  localStorage.clear();
  window.location.href = "/login";
}
