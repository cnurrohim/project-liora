import { useEffect } from "react";
import { useInitApp, reinitializeApp } from "@/hooks/useInitApp";
import { createController } from "./controller";

type AppState = {
  loading: boolean;
  initialized: boolean;
};

export const AppController = createController<AppState>({
  loading: true,
  initialized: false,
});

export function useBindAppInit() {
  const { isReady } = useInitApp();

  useEffect(() => {
    AppController.setState({
      initialized: isReady,
      loading: !isReady,
    });
  }, [isReady]);
}

/** API publik untuk re-init (misalnya setelah switch role) */
export async function appReinit() {
  AppController.setState({ loading: true });
  await reinitializeApp();
  AppController.setState({ loading: false, initialized: true });
}
