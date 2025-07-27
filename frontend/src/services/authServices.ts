type ActiveUser = {
  id: string;
  username: string;
  role_id: string;
  [key: string]: any; // jika ada info lain
};

export function getActiveUser(): ActiveUser | null {
  const raw = localStorage.getItem("user");
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
