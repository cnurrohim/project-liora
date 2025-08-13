import React, { useEffect } from "react";
import MenuBar from "../components/VerticalMenu/MenuBar";
import type { LayoutPosition } from "../config/layoutComponentRegistry";
import { MenuBarController } from "../components/VerticalMenu/MenuBar/controller";
import { SlidingPanelController } from "../components/VerticalMenu/SlidingPanel/controller";
import { TabController } from "../components/Tab/controller";
import { handleMenuClick } from "../utils/handleMenuClick";
import SlidingPanel from "../components/VerticalMenu/SlidingPanel";
import { IconRenderer } from "../components/IconRenderer";
import type { MenuItem } from "@/types/menu";
import { PinnedMenuController } from "@/controller/PinnedMenuController";
import { MenuProviderController } from "@/controller/menuProviderController";

export function createVerticalMenu(position: LayoutPosition) {
  return function SidebarWrapper() {
    const resolved = position === "rightPane" ? "right" : "left";

    useEffect(() => {
      MenuBarController.setPosition(resolved);
      SlidingPanelController.setPosition(resolved);
    }, [position]);

    async function handlePinClick(menuItem: MenuItem) {
      const isPinned = PinnedMenuController.getPinnedMenus().some(
        (m) => m.id === menuItem.id
      );

      PinnedMenuController.getPinnedMenus();

      try {
        if (isPinned) {
          await PinnedMenuController.removePinnedMenu(menuItem.id!);
        } else {
          await PinnedMenuController.addPinnedMenu(menuItem);
        }

        // Pastikan ini dipanggil setelah server selesai clear redis
        await MenuProviderController.load();
      } catch (err) {
        console.error(err);
      }
    }

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
        onPinClick: (item: MenuItem) => {
          const menuItem = { ...item };
          handlePinClick(menuItem);
        },
      }),
      React.createElement(MenuBar)
    );
  };
}
