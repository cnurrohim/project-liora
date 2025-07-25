import { useEffect, useState } from "react";
import { AppConfigController } from "./controller";

export default function useAppConfig() {
  const [config, setConfig] = useState(AppConfigController.getState());

  useEffect(() => {
    const update = () => setConfig(AppConfigController.getState());
    AppConfigController.subscribe(update);
    return () => AppConfigController.unsubscribe(update);
  }, []);

  return config;
}
