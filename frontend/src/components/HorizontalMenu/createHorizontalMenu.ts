import React, { useEffect } from "react";
import MenuBar from "./MenuBar";
import type { LayoutPosition } from "../../config/layoutComponentRegistry";
import { MenuBarController } from "./MenuBar/controller";
import { SlidingPanelController } from "./SlidingPanel/controller";
import { TabController } from "../Tab/controller";
import { handleMenuClick } from "../../utils/handleMenuClick";
import SlidingPanel from "./SlidingPanel";
import { IconRenderer } from "../IconRenderer";

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

          if (typeof menuItem.icon === "string") {
            menuItem.icon = React.createElement(IconRenderer, {
              name: menuItem.icon,
              size: 15,
            });
          }
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
