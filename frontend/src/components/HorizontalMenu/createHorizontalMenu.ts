import React, { useEffect } from "react";
import MenuBar from "./MenuBar";
import type { LayoutPosition } from "../../config/layoutComponentRegistry";
import { MenuBarController } from "./MenuBar/controller";
import { SlidingPanelController } from "./SlidingPanel/controller";
import { TabController } from "../Tab/controller";
import { handleMenuClick } from "../../utils/handleMenuClick";
import SlidingPanel from "./SlidingPanel";

export function createHorizontalMenu(position: LayoutPosition) {
  return function MenuWrapper() {
    const resolved = position === "topPane" ? "top" : "bottom";
    SlidingPanelController.setPosition(resolved);

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
          handleMenuClick(item, currentTabKey);
        },
      }),
      React.createElement(MenuBar)
    );
  };
}
