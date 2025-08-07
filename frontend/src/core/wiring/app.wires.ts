// src/core/wiring/app.wires.ts

import { AppConfigController } from "@/components/AppConfig/controller";
import { MenuBarController as VMenuBarController } from "@/components/VerticalMenu/MenuBar/controller";
import { MenuBarController as HMenuBarController } from "@/components/HorizontalMenu/MenuBar/controller";
import { SlidingPanelController as VSlidingPanelController } from "@/components/VerticalMenu/SlidingPanel/controller";
import { SlidingPanelController as HSlidingPanelController } from "@/components/HorizontalMenu/SlidingPanel/controller";

import type { Wire } from "./setupWiring";

export const appWires: Wire[] = [
  {
    from: AppConfigController.subscribe,
    to: () => {
      const { app_logo, app_name } = AppConfigController.getState();
      VMenuBarController.setAppInfo(app_name, app_logo);
      VSlidingPanelController.setAppInfo(app_name, app_logo);
    },
  },
  {
    from: AppConfigController.subscribe,
    to: () => {
      const { app_logo, app_name } = AppConfigController.getState();
      HMenuBarController.setAppInfo(app_name, app_logo);
      HSlidingPanelController.setAppInfo(app_name, app_logo);
    },
  },
];
