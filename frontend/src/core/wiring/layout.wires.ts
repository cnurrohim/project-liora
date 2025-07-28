// src/core/wiring/layout.wires.ts
import { LayoutController } from "../../controller/layoutController";
import { MenuProviderController } from "../../controller/menuProviderController";

import React from "react";
import tabBar from "../../components/Tab/tabBar";
import type { Wire } from "./setupWiring";

import { createVerticalMenu } from "../../factory/createVerticalMenu";
import { createHorizontalMenu } from "../../factory/createHorizontalMenu";

export const layoutWires: Wire[] = [
  {
    from: MenuProviderController.subscribe,
    to: () => {
      if (LayoutController.isHydrated()) return;

      LayoutController.setPane(
        "leftPane",
        React.createElement(createVerticalMenu("leftPane"))
      );
      LayoutController.setPaneKey("leftPaneKey", "VMenuBar");
      LayoutController.setPaneKey("topPaneKey", "tabbar");
    },
  },
  {
    from: MenuProviderController.subscribe,
    to: () => {
      if (LayoutController.isHydrated()) return;

      LayoutController.setPane("topPane", React.createElement(tabBar));
      LayoutController.setPaneKey("topPaneKey", "tabbar");
    },
  },
  // {
  //   from: MenuProviderController.subscribe,
  //   to: () => {
  //     LayoutController.setPane(
  //       "topPane",
  //       React.createElement(createHorizontalMenu("topPane"))
  //     );
  //   },
  // },
];
