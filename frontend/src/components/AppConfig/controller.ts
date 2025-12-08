import { apiFetch } from "@/utils/apiFetch";

let state = {
  app_name: "",
  app_logo: "",
};

let listeners: (() => void)[] = [];

export const AppConfigController = {
  async loadConfig() {
    try {
      const res = await apiFetch("/app-setting");
      const json = await res.json();

      state = { ...state, ...json };
      notify();
    } catch (err) {
      console.error("Gagal load app.json:", err);
    }
  },
  getState() {
    return { ...state };
  },
  subscribe(cb: () => void) {
    listeners.push(cb);
    return () => {
      this.unsubscribe(cb);
    };
  },
  unsubscribe(cb: () => void) {
    listeners = listeners.filter((f) => f !== cb);
  },
};

function notify() {
  listeners.forEach((cb) => cb());
}
