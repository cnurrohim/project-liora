import React from "react";
import TabBar from "../components/Tab/tabBar";

type TabBarFactoryOptions = {
  iconRenderer?: (iconName?: string) => React.ReactNode;
};

export function createTabBar({ iconRenderer }: TabBarFactoryOptions = {}) {
  return function TabBarWithInjectedDeps() {
    return React.createElement(TabBar, {
      iconRenderer: iconRenderer,
    });
  };
}
