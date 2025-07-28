import { useEffect, useRef, useState } from "react";
import { initializeApp } from "../config/appInit";
import { PermissionController } from "../controller/permissionController";
import { initFromStorage } from "../components/Tab/controller";

export function useInitApp() {
  const [isReady, setReady] = useState(false);
  const stopFnRef = useRef<() => void | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("Tidak ada token, redirect login");
      window.location.href = "/login";
      return;
    }

    async function init() {
      try {
        // ⬅️ Panggil ini dulu agar state permission siap duluan
        await PermissionController.getPermissions();

        const stop = await initializeApp();
        initFromStorage();

        stopFnRef.current = stop;

        setReady(true);
      } catch (err) {
        console.error("Failed to initialize app:", err);
      }
    }

    init();

    return () => {
      stopFnRef.current?.();
    };
  }, []);

  return { isReady };
}
