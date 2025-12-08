import React from "react";
import { createVerticalMenu } from "../factory/createVerticalMenu";
import { createHorizontalMenu } from "../factory/createHorizontalMenu";
import { createTabBar } from "../factory/createTabBar";
import { IconRenderer } from "../components/IconRenderer";
import { createVerticalExpandedMenu } from "@/factory/createVerticalExpandedMenu";

export type LayoutPosition =
  | "leftPane"
  | "rightPane"
  | "topPane"
  | "bottomPane";

export type LayoutComponentDefinition = {
  id: string;
  label: string;
  create: (position: LayoutPosition) => React.ReactNode;
  allowedPositions: LayoutPosition[];
  group: string;
  singleton?: boolean;
};

export const layoutComponentRegistry: LayoutComponentDefinition[] = [
  {
    id: "HMenubar",
    label: "Horizontal Menu",
    create: (position) => React.createElement(createHorizontalMenu(position)),
    allowedPositions: ["topPane", "bottomPane"],
    group: "menu-horizontal",
    singleton: true,
  },
  {
    id: "VMenuBar",
    label: "Vertical Menu",
    create: (position) => React.createElement(createVerticalMenu(position)),
    allowedPositions: ["leftPane", "rightPane"],
    group: "menu-vertical",
    singleton: true,
  },
  {
    id: "VExpandedMenuBar",
    label: "Vertical Expanded Menu",
    create: (position) =>
      React.createElement(createVerticalExpandedMenu(position)),
    allowedPositions: ["leftPane", "rightPane"],
    group: "menu-vertical",
    singleton: true,
  },
  {
    id: "tabbar",
    label: "Tab Bar",
    create: () =>
      React.createElement(
        createTabBar({
          iconRenderer: (name, size = 15) =>
            React.createElement(IconRenderer, { name: name, size: size }),
        })
      ),
    group: "tabbar",
    allowedPositions: ["topPane", "bottomPane"],
  },
];
