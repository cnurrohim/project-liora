import { LayoutController } from "@/controller/layoutController";
import { MenuProviderController } from "@/controller/menuProviderController";
//import { UserPreferencesController } from "@/controller/UserPreferencesController";
import TabContent from "@/components/Tab/TabContent";
import React from "react";
import type { Wire } from "./setupWiring";

export const contentWires: Wire[] = [
  {
    from: MenuProviderController.subscribe,
    to: () => {
      LayoutController.setPane("content", React.createElement(TabContent));
    },
  },
  // {
  //   from: MenuProviderController.subscribe,
  //   to: () => {
  //     UserPreferencesController.set("defaultNewTab", {
  //       key: `tab-${Date.now()}`,
  //       label: "New Tab",
  //       content: "/pages/boxy-launcher",
  //     });
  //   },
  // },
];
