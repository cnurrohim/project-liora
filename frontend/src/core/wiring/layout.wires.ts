// src/core/wiring/layout.wires.ts
import { LayoutController } from "../../controller/layoutController";
import { MenuProviderController } from "../../controller/menuProviderController";

import React from "react";
import tabBar from "../../components/Tab/tabBar";
import type { Wire } from "./setupWiring";

import { createVerticalMenu } from "../../components/VerticalMenu/createVerticalMenu";
import { createHorizontalMenu } from "../../components/HorizontalMenu/createHorizontalMenu";

export const layoutWires: Wire[] = [
  {
    from: MenuProviderController.subscribe,
    to: () => {
      LayoutController.setPane(
        "leftPane",
        React.createElement(createVerticalMenu("leftPane"))
      );
    },
  },
  {
    from: MenuProviderController.subscribe,
    to: () => {
      LayoutController.setPane("topPane", React.createElement(tabBar));
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
