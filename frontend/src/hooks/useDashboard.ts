import { DashboardController } from "@/controller/DashboardController";
import { useEffect, useState } from "react";

export function useDashboard() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const rerender: () => void = () => setTick((t) => t + 1);
    DashboardController.subscribe(rerender);
    DashboardController.init();
    return () => DashboardController.unsubscribe(rerender);
  }, []);

  return {
    layout: DashboardController.getLayout(),
    mode: DashboardController.getMode(),
    isLoading: DashboardController.isLoading(),
    setMode: DashboardController.setMode,
    save: DashboardController.save,
  };
}
