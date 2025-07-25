// src/components/AppConfig/controller.ts
let state = {
  name: "",
  logo: "",
};

let listeners: (() => void)[] = [];

export const AppConfigController = {
  async loadConfig() {
    try {
      const res = await fetch("./dummyData/app.json");
      const json = await res.json();
      state = { ...state, ...json };
    } catch (err) {
      console.error("Gagal load app.json:", err);
    }
    notify();
  },
  getState() {
    return { ...state };
  },
  subscribe(cb: () => void) {
    listeners.push(cb);
  },
  unsubscribe(cb: () => void) {
    listeners = listeners.filter((f) => f !== cb);
  },
};

function notify() {
  listeners.forEach((cb) => cb());
}
