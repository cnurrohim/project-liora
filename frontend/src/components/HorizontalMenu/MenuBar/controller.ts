import type { MenuBarEntry } from "../types";

type MenuBarState = {
  start: MenuBarEntry[];
  end: MenuBarEntry[];
  position: "top" | "bottom";
  logo: string;
  name: string;
};

let state: MenuBarState = {
  start: [],
  end: [],
  position: "top",
  logo: "",
  name: "",
};

let listeners: (() => void)[] = [];
let activeKey: string | null = null;

export const MenuBarController = {
  setActive(key: string) {
    activeKey = key;
    notify();
  },
  getActive() {
    return activeKey;
  },
  setEntries(entries: MenuBarEntry[]) {
    state = {
      start: entries.filter((e) => e.alignment === "start"),
      end: entries.filter((e) => e.alignment === "end"),
      position: state.position,
      logo: state.logo,
      name: state.name,
    };
    notify();
  },
  setPosition(pos: "top" | "bottom") {
    state.position = pos;
    notify();
  },
  setAppInfo(newName: string, newLogo: string) {
    state.name = newName;
    state.logo = newLogo;
    notify();
  },
  getState(): MenuBarState {
    return { ...state };
  },
  subscribe(callback: () => void) {
    listeners.push(callback);
  },
  unsubscribe(callback: () => void) {
    listeners = listeners.filter((cb) => cb !== callback);
  },
};

function notify() {
  listeners.forEach((cb) => cb());
}
