import React, { useEffect } from "react";
import MenuBar from "../components/HorizontalMenu/MenuBar";
import type { LayoutPosition } from "../config/layoutComponentRegistry";
import { MenuBarController } from "../components/HorizontalMenu/MenuBar/controller";
import { SlidingPanelController } from "../components/HorizontalMenu/SlidingPanel/controller";
import { TabController } from "../components/Tab/controller";
import { handleMenuClick } from "../utils/handleMenuClick";
import SlidingPanel from "../components/HorizontalMenu/SlidingPanel";
import { IconRenderer } from "../components/IconRenderer";

export function createHorizontalMenu(position: LayoutPosition) {
  return function MenuWrapper() {
    const resolved = position === "topPane" ? "top" : "bottom";

    useEffect(() => {
      MenuBarController.setPosition(resolved);
      SlidingPanelController.setPosition(resolved);
    }, [position]);

    return React.createElement(
      "div",
      { className: "relative flex h-full w-full z-10" },
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
        defaultIcon: React.createElement(IconRenderer, {
          name: "RiApps2Line",
          size: 15,
        }),
      }),
      React.createElement(MenuBar)
    );
  };
}
