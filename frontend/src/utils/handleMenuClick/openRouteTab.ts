import React from "react";
import { TabController } from "../../components/Tab/controller";
import PagesNotFound from "../../pages/Misc/404";
import type { MenuRoute } from "../../types/menu";
import { RouteRegistry } from "../../config/routeRegistry";

export function openRouteTab(item: MenuRoute, currentTabKey?: string | null) {
  const component =
    RouteRegistry.get(item.route) ?? React.createElement(PagesNotFound);
  const tab = {
    key: item.route,
    label: item.label,
    route: item.route,
    icon: item.icon,
    content: component,
  };

  const existing = TabController.getTabByRoute(item.route);
  if (existing) {
    TabController.setActiveTab(existing.key);
  } else if (currentTabKey && TabController.isTemporaryTab(currentTabKey)) {
    TabController.replaceTab(currentTabKey, tab);
  } else {
    TabController.openTab(tab);
  }
}

export function replaceTab(item: MenuRoute) {
  const component =
    RouteRegistry.get(item.route) ?? React.createElement(PagesNotFound);

  const activeTab = TabController.getActiveTabKey();

  const tab = {
    key: item.route,
    label: item.label,
    route: item.route,
    icon: item.icon,
    content: component,
  };

  if (activeTab) {
    TabController.replaceTab(activeTab, tab);
  } else {
    TabController.openTab(tab);
  }
}
