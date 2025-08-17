import type { MenuBarEntry } from "../types";

type MenuBarState = {
  start: MenuBarEntry[];
  end: MenuBarEntry[];
  position: "top" | "bottom";
};

let state: MenuBarState = {
  start: [],
  end: [],
  position: "top",
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
    };
    notify();
  },
  setPosition(pos: "top" | "bottom") {
    state.position = pos;
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
