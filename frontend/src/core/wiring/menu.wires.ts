import { MenuProviderController } from "@/controller/menuProviderController";
import { MenuBarController as VMenuBarController } from "@/components/VerticalMenu/MenuBar/controller";
import { MenuBarController as HMenuBarController } from "@/components/HorizontalMenu/MenuBar/controller";
import type { Wire } from "./setupWiring";
import type { MenuBarEntry as VMenuBarEntry } from "@/components/VerticalMenu/MenuBar/types";
import type { MenuBarEntry as HMenuBarEntry } from "@/components/VerticalMenu/MenuBar/types";
import { IconRenderer } from "@/components/IconRenderer";
import React from "react";
import { SlidingPanelController as VSlidingPanelController } from "@/components/VerticalMenu";
import { SlidingPanelController as HSlidingPanelController } from "@/components/HorizontalMenu";
import {
  MenuBarController as VEMenuBarController,
  SlidingPanelController as VESlidingPanelController,
  type MenuBarEntry as VEMenuBarEntry,
} from "@/components/VerticalMenuExpanded";

export function menuWires(): Wire[] {
  return [
    {
      from: MenuProviderController.subscribe,
      to: () => {
        const sections = MenuProviderController.getState().sections;
        VSlidingPanelController.setAllMenu(sections);
        const vActive = VMenuBarController.getActive();
        if (vActive) {
          const section = sections.find((s) => s.id === vActive);
          if (section) {
            VSlidingPanelController.setMenu(section);
          } else {
            VSlidingPanelController.close();
          }
        }
        // Inject ke VMenuBarController
        const miniEntries: VMenuBarEntry[] = sections.map((section) => ({
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

        VMenuBarController.setEntries(miniEntries);
      },
    },
    {
      from: MenuProviderController.subscribe,
      to: () => {
        const sections = MenuProviderController.getState().sections;
        HSlidingPanelController.setAllMenu(sections);
        const hActive = HMenuBarController.getActive();
        if (hActive) {
          const section = sections.find((s) => s.id === hActive);
          if (section) {
            HSlidingPanelController.setMenu(section);
          } else {
            HSlidingPanelController.close();
          }
        }

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
    {
      from: MenuProviderController.subscribe,
      to: () => {
        const sections = MenuProviderController.getState().sections;
        VESlidingPanelController.setAllMenu(sections);
        const hActive = VEMenuBarController.getActive();
        if (hActive) {
          const section = sections.find((s) => s.id === hActive);
          if (section) {
            VESlidingPanelController.setMenu(section);
          } else {
            VESlidingPanelController.close();
          }
        }

        const miniEntries: VEMenuBarEntry[] = sections.map((section) => ({
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

        VEMenuBarController.setEntries(miniEntries);
      },
    },
  ];
}
