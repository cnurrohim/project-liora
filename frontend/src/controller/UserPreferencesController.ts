import { themes, type ThemeId } from "@/config/themes";
import { apiFetch } from "@/utils/apiFetch";

export type TabItem = {
  key: string;
  label: string;
  route?: string;
  content: string;
};

type UserPreferences = {
  defaultPage: string | null;
  defaultNewTab: string | null;
  theme: string | null;
  language: string | null;
};

const state: UserPreferences = {
  defaultPage: null,
  defaultNewTab: null,
  theme: "light",
  language: "en",
};

let updateCallbacks: (() => void)[] = [];

export const UserPreferencesController = {
  async load(userID: string, roleID: string) {
    try {
      this.clear();
      const res = await apiFetch(`/user-layout/config/${userID}/${roleID}`);
      const config = await res.json();

      if (config.default_page) {
        this.set("defaultPage", config.default_page);
      }

      if (config.default_new_tab) {
        this.set("defaultNewTab", config.default_new_tab);
      }

      if (config.theme) {
        this.set("theme", config.theme);
        this.applyTheme(config.theme as ThemeId);
      }

      notify();
    } catch (err) {
      console.error("Gagal load user preferences:", err);
    }
  },

  set<K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) {
    state[key] = value;
    notify();
  },

  get<K extends keyof UserPreferences>(key: K): UserPreferences[K] {
    return state[key];
  },

  getState(): UserPreferences {
    return { ...state };
  },

  clear() {
    state.defaultPage = null;
    state.defaultNewTab = null;
    state.theme = "light";
    state.language = "en";
  },

  applyTheme(theme: ThemeId) {
    const root = document.documentElement;
    root.classList.remove(...themes.map((t) => t.id));
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  },

  subscribe(cb: () => void) {
    updateCallbacks.push(cb);
  },

  unsubscribe(cb: () => void) {
    updateCallbacks = updateCallbacks.filter((fn) => fn !== cb);
  },
};

function notify() {
  updateCallbacks.forEach((cb) => cb());
}
