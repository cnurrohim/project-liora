import type { MenuItem, MenuSection } from "../../../types/menu";

let state = {
  start: null as MenuSection | null,
  end: null as MenuSection | null,
  visible: false as boolean,
  activePath: [] as number[],
  position: "top" as "top" | "bottom",
  appName: "App" as string,
  appLogo: "" as string,
  hidden: true as boolean,
};

let listeners: (() => void)[] = [];

export const SlidingPanelController = {
  setMenu(section: MenuSection) {
    state.start = section;
    listeners.forEach((cb) => cb());
    notify();
  },
  setPosition(pos: "top" | "bottom") {
    state.position = pos;
    notify();
  },
  setActivePath(path: number[]) {
    state.activePath = path;
    notify();
  },
  setAppInfo(name: string, logo: string) {
    state.appName = name;
    state.appLogo = logo;
    notify();
  },
  goBack() {
    state.activePath = state.activePath.slice(0, -1);
    notify();
  },
  toggle() {
    state.visible = !state.visible;
    state.hidden = !state.hidden;
    notify();
  },
  close() {
    state.visible = false;
    state.hidden = true;
    notify();
  },
  open() {
    state.visible = true;
    state.hidden = false;
    notify();
  },
  getState() {
    return { ...state };
  },
  subscribe(cb: () => void) {
    listeners.push(cb);
  },
  unsubscribe(cb: () => void) {
    listeners = listeners.filter((fn) => fn !== cb);
  },
};

function notify() {
  listeners.forEach((cb) => cb());
}

export function resolveItems(
  section: MenuSection | null,
  path: number[]
): MenuItem[] {
  if (!section) return [];
  let items = section.items;
  for (const index of path) {
    const current = items?.[index];
    if (current?.type === "group") {
      items = current.items;
    } else {
      break;
    }
  }
  return items ?? [];
}
