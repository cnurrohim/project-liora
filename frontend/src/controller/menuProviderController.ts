// src/controllers/menuProviderController.ts
import type { MenuSection, MenuMode, MenuAlignment } from "../types/menu";
import { apiFetch } from "../utils/apiFetch";

type MenuState = {
  sections: MenuSection[];
};

const state: MenuState = {
  sections: [],
};

let subscribers: (() => void)[] = [];

export const MenuProviderController = {
  async load() {
    try {
      const res = await apiFetch("/menu");
      const data = (await res.json()).data;
      state.sections = data;
      notify();
    } catch (err) {
      console.error("Failed to load menu.json", err);
    }
  },

  getSection(key: string): MenuSection | undefined {
    return this.getState().sections.find((s) => s.id === key);
  },

  getState() {
    return { ...state };
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
