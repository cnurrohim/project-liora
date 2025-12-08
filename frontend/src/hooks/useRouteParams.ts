import { useMemo } from "react";
import { TabController } from "../components/Tab/controller";

export function useRouteParamsFromTab(pathTemplate: string) {
  return useMemo(() => {
    const activeKey = TabController.getState().activeTabKey;
    if (!activeKey) return {};

    const tab = TabController.getState().openTabs.find(
      (t) => t.key === activeKey
    );
    const route = tab?.route;
    if (!route) return {};

    const routeParts = route.split("/");
    const templateParts = pathTemplate.split("/");

    if (routeParts.length !== templateParts.length) {
      return {}; // ❌ jumlah segmen tidak cocok
    }

    const params: Record<string, string> = {};

    for (let i = 0; i < templateParts.length; i++) {
      const tpl = templateParts[i];
      const actual = routeParts[i];
      if (tpl.startsWith(":")) {
        const key = tpl.slice(1);
        params[key] = actual;
      } else if (tpl !== actual) {
        return {}; // ❌ segmen statis tidak cocok
      }
    }

    return params;
  }, []);
}
