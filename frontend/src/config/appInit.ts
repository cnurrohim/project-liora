import { AppConfigController } from "../components/AppConfig/controller";
import { startRave } from "../components/Effects/raveEffect";
import {
  LayoutController,
  type LayoutConfig,
} from "../controller/layoutController";
import { MenuProviderController } from "../controller/menuProviderController";
import { connectOutputToInput, setupWiring, wiringMap } from "../core/wiring";
import { getLayout } from "../pages/Preferences/layout.api";
import { getActiveUser } from "../services/authServices";
import { layoutComponentRegistry } from "./layoutComponentRegistry";
import { registerRoutes } from "./route.register";

export async function initializeApp(): Promise<() => void> {
  await Promise.all([
    MenuProviderController.load(),
    AppConfigController.loadConfig(),
    hydrateUserLayout(),
  ]);

  const { name, logo } = AppConfigController.getState();
  applyAppMetadata(name, logo);

  setupWiring(wiringMap, connectOutputToInput);
  registerRoutes();

  const stopRave = startRave(200);

  return () => {
    stopRave?.();
  };
}

export async function hydrateUserLayout(): Promise<boolean> {
  const user = getActiveUser();
  if (!user) return false;

  const layout = await getLayout(user.id, user.defaultRole.id);

  if (!layout) return false;

  for (const pos of [
    "leftPane",
    "rightPane",
    "topPane",
    "bottomPane",
  ] as const) {
    const componentId = layout[pos];
    if (!componentId) continue;
    const def = layoutComponentRegistry.find((c) => c.id === componentId);
    if (!def) continue;

    LayoutController.updatePaneWithKey(pos, componentId, def.create(pos));
  }

  LayoutController.markAsHydrated();

  return true;
}

export function applyAppMetadata(name: string, logo: string) {
  if (name) document.title = name;
  if (logo) document.title = logo + " " + name;

  // if (logo) {
  //   const existing = document.querySelector("link[rel*='icon']");
  //   let link: HTMLLinkElement;

  //   if (existing instanceof HTMLLinkElement) {
  //     link = existing;
  //   } else {
  //     link = document.createElement("link");
  //   }

  //   link.type = "image/svg+xml";
  //   link.rel = "icon";
  //   link.href = logo;
  //   document.head.appendChild(link);

  //   document.head.appendChild(link);
  // }
}
