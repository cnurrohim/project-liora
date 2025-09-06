import { useEffect, useRef, useState } from "react";
import { initializeApp } from "../config/appInit";
import { PermissionController } from "../controller/permissionController";

let globalStopFn: (() => void) | null = null;

export async function reinitializeApp() {
  try {
    // matikan wiring lama
    globalStopFn?.();
    // init ulang
    await PermissionController.getPermissions();
    const stop = await initializeApp();
    globalStopFn = stop;
  } catch (err) {
    console.error("Failed to re-initialize app:", err);
  }
}

/** dipakai sekali saat app mount (mis. di App.tsx) */
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
        await PermissionController.getPermissions();
        const stop = await initializeApp();

        stopFnRef.current = stop;
        globalStopFn = stop;

        setReady(true);
      } catch (err) {
        console.error("Failed to initialize app:", err);
      }
    }

    init();

    return () => {
      stopFnRef.current?.();
      // pastikan global stop dibersihkan jika unmount
      if (globalStopFn === stopFnRef.current) globalStopFn = null;
    };
  }, []);

  return { isReady };
}
