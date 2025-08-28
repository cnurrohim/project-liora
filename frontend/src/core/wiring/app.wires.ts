import { AppConfigController } from "@/components/AppConfig/controller";
import { AppInfoController as VAppInfoController } from "@/components/VerticalMenu/appInfoController";
import { AppInfoController as HAppInfoController } from "@/components/HorizontalMenu/appInfoController";

import type { Wire } from "./setupWiring";
import { AppInfoController as VEAppInfoController } from "@/components/VerticalMenuExpanded/appInfoController";

export const appWires: Wire[] = [
  {
    from: AppConfigController.subscribe,
    to: () => {
      const { app_logo, app_name } = AppConfigController.getState();
      VAppInfoController.setAppInfo(app_name, app_logo);
    },
  },
  {
    from: AppConfigController.subscribe,
    to: () => {
      const { app_logo, app_name } = AppConfigController.getState();
      HAppInfoController.setAppInfo(app_name, app_logo);
    },
  },
  {
    from: AppConfigController.subscribe,
    to: () => {
      const { app_logo, app_name } = AppConfigController.getState();
      VEAppInfoController.setAppInfo(app_name, app_logo);
    },
  },
];
