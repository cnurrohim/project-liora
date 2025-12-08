import type { MenuSection, MenuMode, MenuAlignment } from "../types/menu";
import { apiFetch } from "../utils/apiFetch";

export type RouteMenuMeta = {
  icon: string | undefined;
  icon_color: string | undefined;
  label: string;
  id: string;
};

type MenuState = {
  sections: MenuSection[];
  routeMenuMap: Record<string, RouteMenuMeta | null>;
};

const state: MenuState = {
  sections: [],
  routeMenuMap: {},
};

let subscribers: (() => void)[] = [];

export const MenuProviderController = {
  async load() {
    try {
      const res = await apiFetch("/menu");
      const { data, routeMenuMap } = await res.json();
      state.sections = data;
      state.routeMenuMap = routeMenuMap ?? {};

      notify();
    } catch (err) {
      console.error("Failed to load menu", err);
    }
  },

  getSection(key: string): MenuSection | undefined {
    return this.getState().sections.find((s) => s.id === key);
  },

  getState() {
    return { ...state };
  },

  getMenuMetaByRoute(route: string): RouteMenuMeta | null {
    return state.routeMenuMap[route] ?? null;
  },

  getSectionsByMode(mode: MenuMode): MenuSection[] {
    return state.sections.filter((s) => s.mode === mode);
  },

  getSectionsByAlignment(alignment: MenuAlignment): MenuSection[] {
    return state.sections.filter((s) => s.alignment === alignment);
  },

  getSectionByKey(key: string): MenuSection | undefined {
    return state.sections.find((s) => s.id === key);
  },

  subscribe(cb: () => void) {
    subscribers.push(cb);
  },

  unsubscribe(cb: () => void) {
    subscribers = subscribers.filter((f) => f !== cb);
  },
};

function notify() {
  subscribers.forEach((cb) => cb());
}
