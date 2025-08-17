import React, { useEffect } from "react";
import MenuBar from "../components/VerticalMenu/MenuBar";
import type { LayoutPosition } from "../config/layoutComponentRegistry";
import { MenuBarController } from "../components/VerticalMenu/MenuBar/controller";
import { SlidingPanelController } from "../components/VerticalMenu/SlidingPanel/controller";
import { TabController } from "../components/Tab/controller";
import { handleMenuClick, runCommand } from "../utils/handleMenuClick";
import SlidingPanel from "../components/VerticalMenu/SlidingPanel";
import { IconRenderer } from "../components/IconRenderer";
import type { MenuItem } from "@/types/menu";
import { PinnedMenuController } from "@/controller/PinnedMenuController";
import { MenuProviderController } from "@/controller/menuProviderController";
import { openTabSmart } from "@/utils/handleMenuClick/openTabSmart";
import { switchRoleAPI } from "@/pages/LoginPage/login.api";
import { reinitializeApp } from "@/hooks/useInitApp";
import { showErrorToast, showSuccessToast } from "@/utils/toast";

export function createVerticalMenu(position: LayoutPosition) {
  return function SidebarWrapper() {
    const resolved = position === "rightPane" ? "right" : "left";

    useEffect(() => {
      MenuBarController.setPosition(resolved);
      SlidingPanelController.setPosition(resolved);
    }, [resolved]);

    const handlePinClick = async (menuItem: MenuItem) => {
      try {
        const isPinned = PinnedMenuController.getPinnedMenus().some(
          (m) => m.id === menuItem.id
        );

        if (isPinned) {
          await PinnedMenuController.removePinnedMenu(menuItem.id!);
        } else {
          await PinnedMenuController.addPinnedMenu(menuItem);
        }

        await MenuProviderController.load();
      } catch (err) {
        console.error("Gagal update pinned menu:", err);
      }
    };

    async function handleSwitchRole(roleId: string) {
      try {
        const { token, user } = await switchRoleAPI(roleId);

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        await reinitializeApp();

        showSuccessToast(`Role switched to ${user.defaultRole.name}`);
      } catch (err) {
        showErrorToast(`Switch role failed: ${err}`);
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
        onViewProfileClick: () => {
          openTabSmart(
            {
              id: `user-profile`,
              route: `/profile`,
              label: `User Profile`,
              type: "route",
              icon: "RiPencilFill",
            },
            { replace: true }
          );
          SlidingPanelController.close();
        },
        onLogout: () => {
          runCommand({
            id: "logout",
            label: "logout",
            type: "command",
            command: "logout",
          });
        },
        onSwitchRole: (userId) => {
          handleSwitchRole(userId);
        },
      }),
      React.createElement(MenuBar)
    );
  };
}
