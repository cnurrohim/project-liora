// src/core/wiring/menu.wires.ts
import { MenuProviderController } from "../../controller/menuProviderController";
import { MenuBarController as VMenuBarController } from "../../components/VerticalMenu/MenuBar/controller";
import { MenuBarController as HMenuBarController } from "../../components/HorizontalMenu/MenuBar/controller";
import type { Wire } from "./setupWiring";
import type { MenuBarEntry as VMenuBarEntry } from "../../components/VerticalMenu/MenuBar/types";
import type { MenuBarEntry as HMenuBarEntry } from "../../components/VerticalMenu/MenuBar/types";
import { IconRenderer } from "../../components/IconRenderer";
import React from "react";

export function menuWires(): Wire[] {
  return [
    {
      from: MenuProviderController.subscribe,
      to: () => {
        const sections = MenuProviderController.getState().sections;

        // Inject ke VMenuBarController
        const miniEntries: VMenuBarEntry[] = sections.map((section) => ({
          key: section.id,
          label: section.label ?? section.id,
          //icon: section.icon ?? "•",
          icon: React.createElement(IconRenderer, {
            name: section.icon,
            color: section.icon_color,
            size: 20,
          }),
          mode: section.mode,
          alignment: section.alignment,
        }));

        VMenuBarController.setEntries(miniEntries);
      },
    },
    {
      from: MenuProviderController.subscribe,
      to: () => {
        const sections = MenuProviderController.getState().sections;

        // Inject ke HMenuBarController
        const miniEntries: HMenuBarEntry[] = sections.map((section) => ({
          key: section.id,
          label: section.label ?? section.id,
          icon: React.createElement(IconRenderer, {
            name: section.icon,
            color: section.icon_color,
            size: 20,
          }),
          mode: section.mode,
          alignment: section.alignment,
        }));

        HMenuBarController.setEntries(miniEntries);
      },
    },
  ];
}
