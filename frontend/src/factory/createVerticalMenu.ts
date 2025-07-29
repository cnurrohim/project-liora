import React, { useEffect } from "react";
import MenuBar from "../components/VerticalMenu/MenuBar";
import type { LayoutPosition } from "../config/layoutComponentRegistry";
import { MenuBarController } from "../components/VerticalMenu/MenuBar/controller";
import { SlidingPanelController } from "../components/VerticalMenu/SlidingPanel/controller";
import { TabController } from "../components/Tab/controller";
import { handleMenuClick } from "../utils/handleMenuClick";
import SlidingPanel from "../components/VerticalMenu/SlidingPanel";
import { IconRenderer } from "../components/IconRenderer";

export function createVerticalMenu(position: LayoutPosition) {
  return function SidebarWrapper() {
    const resolved = position === "rightPane" ? "right" : "left";

    useEffect(() => {
      MenuBarController.setPosition(resolved);
      SlidingPanelController.setPosition(resolved);
    }, [position]);

    return React.createElement(
      "div",
      { className: "relative flex h-full w-full z-20" },
      React.createElement(SlidingPanel, {
        onItemClick: (item) => {
          const currentTabKey = TabController.getActiveTabKey() ?? undefined;
          const menuItem = { ...item };
          handleMenuClick(menuItem, currentTabKey);
        },
        iconRenderer: ({ name, size, color }) => {
          return React.createElement(IconRenderer, {
            name,
            size,
            color,
          });
        },
        defaultIcon: ({ size, color }) => {
          return React.createElement(IconRenderer, {
            name: "RiApps2Line",
            size,
            color,
          });
        },
      }),
      React.createElement(MenuBar)
    );
  };
}
