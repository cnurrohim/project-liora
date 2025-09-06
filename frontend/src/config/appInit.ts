import { PinnedMenuController } from "@/controller/PinnedMenuController";
import { AppConfigController } from "../components/AppConfig/controller";
import { LayoutController } from "../controller/layoutController";
import { MenuProviderController } from "../controller/menuProviderController";
import { connectOutputToInput, setupWiring, wiringMap } from "../core/wiring";
import { getLayout } from "../pages/Preferences/layout.api";
import { getActiveUser, type ActiveUser } from "../services/authServices";
import { layoutComponentRegistry } from "./layoutComponentRegistry";
import { registerRoutes } from "./route.register";
import { ProfileController } from "@/controller/ProfileController";
import { TabController } from "@/components/Tab/controller";
import { UserPreferencesController } from "@/controller/UserPreferencesController";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export async function initializeApp(): Promise<() => void> {
  setupWiring(wiringMap, connectOutputToInput);

  const user = getActiveUser();
  if (!user) {
    console.warn("❗ There is no active user, skip layout & tab hydrate");
  } else {
    const hydrated = await hydrateUserLayout(user);
    if (!hydrated) {
      console.warn("❗ Failed to hydrate layout");
    }
    await hydratePreferences(user);
  }

  await AppConfigController.loadConfig();

  await MenuProviderController.load();
  await ProfileController.load();

  await PinnedMenuController.init();

  const { app_name, app_logo } = AppConfigController.getState();
  applyAppMetadata(app_name, app_logo);

  registerRoutes();

  return () => {};
}

export async function hydrateUserTab(user: ActiveUser) {
  TabController.setTabStorageKey(user.id, user.defaultRole.id);
}

export async function hydratePreferences(user: ActiveUser) {
  await UserPreferencesController.load(user.id, user.defaultRole.id);

  const defaultPage = UserPreferencesController.get("defaultPage");
  TabController.setDefaultPage(defaultPage);

  await hydrateUserTab(user);
}

export async function hydrateUserLayout(user: ActiveUser): Promise<boolean> {
  const layout = await getLayout(user.id, user.defaultRole.id);
  if (!layout) return false;

  // 🔹 Reset semua pane sebelum isi ulang
  for (const pos of [
    "leftPane",
    "rightPane",
    "topPane",
    "bottomPane",
  ] as const) {
    LayoutController.updatePaneWithKey(pos, null, null);
  }

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
