import { AppConfigController } from "../components/AppConfig/controller";
import { startRave } from "../components/Effects/raveEffect";
import { LayoutController } from "../controller/layoutController";
import { MenuProviderController } from "../controller/menuProviderController";
import { connectOutputToInput, setupWiring, wiringMap } from "../core/wiring";
import { getLayout } from "../pages/Preferences/layout.api";
import { getActiveUser } from "../services/authServices";
import { layoutComponentRegistry } from "./layoutComponentRegistry";
import { registerRoutes } from "./route.register";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export async function initializeApp(): Promise<() => void> {
  setupWiring(wiringMap, connectOutputToInput);

  const hydrated = await hydrateUserLayout();
  if (!hydrated) {
    console.warn("❗ Layout tidak berhasil dihydrasi");
  }

  await AppConfigController.loadConfig();

  await MenuProviderController.load();

  const { app_name, app_logo } = AppConfigController.getState();
  applyAppMetadata(app_name, app_logo);

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

export function applyAppMetadata(app_name: string, app_logo: string | null) {
  if (app_name) document.title = app_name;

  if (app_logo) {
    let link: HTMLLinkElement | null =
      document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }

    link.href = `${API_URL}/uploads/${app_logo}`;
    link.type = app_logo.endsWith(".svg") ? "image/svg+xml" : "image/png";
  }
}
