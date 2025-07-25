import React, { useEffect } from "react";
import MenuBar from "./MenuBar";
import type { LayoutPosition } from "../../config/layoutComponentRegistry";
import { MenuBarController } from "./MenuBar/controller";
import { SlidingPanelController } from "./SlidingPanel/controller";
import { TabController } from "../Tab/controller";
import { handleMenuClick } from "../../utils/handleMenuClick";
import SlidingPanel from "./SlidingPanel";
import { IconRenderer } from "../IconRenderer";

export function createVerticalMenu(position: LayoutPosition) {
  return function SidebarWrapper() {
    const resolved = position === "rightPane" ? "right" : "left";
    SlidingPanelController.setPosition(resolved);

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
          handleMenuClick(item, currentTabKey);
        },
        iconRenderer: ({ name, size, color }) => {
          return React.createElement(IconRenderer, {
            name,
            size,
            color,
          });
        },
      }),
      React.createElement(MenuBar)
    );
  };
}
