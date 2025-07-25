import React from "react";
import { TabController } from "../../components/Tab/controller";
import { RouteRegistry } from "../../config/routeRegistry";
import type { MenuRoute } from "../../types/menu";
import PagesNotFound from "../../pages/PagesNotFound";

export function openTabSmart(
  item: MenuRoute,
  options?: { replace?: boolean; remember?: boolean }
) {
  const component =
    RouteRegistry.get(item.route) ?? React.createElement(PagesNotFound);

  const tab = {
    key: item.route,
    label: item.label,
    route: item.route,
    content: component,
  };

  const activeTab = TabController.getActiveTabKey();

  if (options?.replace && activeTab) {
    if (options.remember) {
      TabController.replaceTabWithBackStack(tab);
    } else {
      TabController.replaceTab(activeTab, tab);
    }
  } else {
    TabController.openTab(tab);
  }
}
