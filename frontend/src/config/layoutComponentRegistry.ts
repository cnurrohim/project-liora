// src/registry/layoutComponentRegistry.ts
import React from "react";
import tabBar from "../components/Tab/tabBar";
import { createVerticalMenu } from "../components/VerticalMenu/createVerticalMenu";
import { createHorizontalMenu } from "../components/HorizontalMenu/createHorizontalMenu";

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
    create: () => React.createElement(tabBar),
    allowedPositions: ["topPane", "bottomPane"],
  },
];
