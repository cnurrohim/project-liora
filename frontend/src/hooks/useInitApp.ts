import { useEffect, useRef, useState } from "react";
import { initializeApp } from "../config/appInit";
import { PermissionController } from "../controller/permissionController";

export function useInitApp() {
  const [isReady, setReady] = useState(false);
  const stopFnRef = useRef<() => void | null>(null);

  useEffect(() => {
    async function init() {
      try {
        // ⬅️ Panggil ini dulu agar state permission siap duluan
        await PermissionController.getPermissions();

        const stop = await initializeApp();
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
