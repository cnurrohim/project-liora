import { useEffect } from "react";

export function useAuthRedirect(path: string = "/") {
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      window.location.href = path;
    }
  }, [path]);
}
