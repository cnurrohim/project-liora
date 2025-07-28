// src/registry/layoutComponentRegistry.ts
import React from "react";
import { createVerticalMenu } from "../factory/createVerticalMenu";
import { createHorizontalMenu } from "../factory/createHorizontalMenu";
import { createTabBar } from "../factory/createTabBar";
import { IconRenderer } from "../components/IconRenderer";

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
  singleton?: boolean;
};

export const layoutComponentRegistry: LayoutComponentDefinition[] = [
  {
    id: "HMenubar",
    label: "Horizontal Menu",
    create: (position) => React.createElement(createHorizontalMenu(position)),
    allowedPositions: ["topPane", "bottomPane"],
    singleton: true,
  },
  {
    id: "VMenuBar",
    label: "Vertical Menu",
    create: (position) => React.createElement(createVerticalMenu(position)),
    allowedPositions: ["leftPane", "rightPane"],
    singleton: true,
  },
  {
    id: "tabbar",
    label: "Tab Bar",
    create: () =>
      React.createElement(
        createTabBar({
          iconRenderer: (name) =>
            React.createElement(IconRenderer, { name: name, size: 15 }),
        })
      ),
    allowedPositions: ["topPane", "bottomPane"],
  },
];
