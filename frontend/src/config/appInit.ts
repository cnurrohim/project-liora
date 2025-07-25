import { AppConfigController } from "../components/AppConfig/controller";
import { startRave } from "../components/Effects/raveEffect";
import { MenuProviderController } from "../controller/menuProviderController";
import { connectOutputToInput, setupWiring, wiringMap } from "../core/wiring";
import { registerRoutes } from "./route.register";

export async function initializeApp(): Promise<() => void> {
  await Promise.all([
    MenuProviderController.load(),
    AppConfigController.loadConfig(),
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
