import { AppConfigController } from "../components/AppConfig/controller";
import { startRave } from "../components/Effects/raveEffect";
import { LayoutController } from "../controller/layoutController";
import { MenuProviderController } from "../controller/menuProviderController";
import { connectOutputToInput, setupWiring, wiringMap } from "../core/wiring";
import { getLayout } from "../pages/Preferences/layout.api";
import { getActiveUser } from "../services/authServices";
import { layoutComponentRegistry } from "./layoutComponentRegistry";
import { registerRoutes } from "./route.register";

export async function initializeApp(): Promise<() => void> {
  setupWiring(wiringMap, connectOutputToInput);

  const hydrated = await hydrateUserLayout();
  if (!hydrated) {
    console.warn("❗ Layout tidak berhasil dihydrasi");
  }

  await AppConfigController.loadConfig();

  await MenuProviderController.load();

  const { name, logo } = AppConfigController.getState();
  applyAppMetadata(name, logo);

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
}
