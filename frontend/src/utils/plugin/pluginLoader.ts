import { registry } from "./registry";

export function loadPlugins(plugins) {
  plugins.forEach((plugin) => {
    plugin.init(registry);
    console.log(`[PLUGIN] Loaded: ${plugin.name}`);
  });
}
