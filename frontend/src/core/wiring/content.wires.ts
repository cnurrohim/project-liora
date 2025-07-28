// src/core/wiring/content.wires.ts
import { LayoutController } from "../../controller/layoutController";
import { MenuProviderController } from "../../controller/menuProviderController";
import { DefaultPageController } from "../../controller/DefaultPageController";
import TabContent from "../../components/Tab/TabContent";
import React from "react";
import type { Wire } from "./setupWiring";

export const contentWires: Wire[] = [
  {
    from: MenuProviderController.subscribe,
    to: () => {
      LayoutController.setPane("content", React.createElement(TabContent));
    },
  },
  {
    from: MenuProviderController.subscribe,
    to: () => {
      DefaultPageController.setDefaultPage({
        key: `tab-${Date.now()}`,
        label: "New Tab",
        content: "/pages/launcher",
      });
    },
  },
];
