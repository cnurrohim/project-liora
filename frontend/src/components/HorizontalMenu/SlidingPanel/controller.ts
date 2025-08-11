import type { MenuItem, MenuSection } from "../../../types/menu";
import { MENU } from "../constant";

let state = {
  start: null as MenuSection | null,
  end: null as MenuSection | null,
  visible: false as boolean,
  activePath: [] as number[],
  position: "top" as "top" | "bottom",
  appName: "App" as string,
  appLogo: "" as string,
  hidden: true as boolean,
  allMenus: [] as MenuSection[],
};

let listeners: (() => void)[] = [];

export const SlidingPanelController = {
  setMenu(section: MenuSection) {
    const items = Array.isArray(section.items) ? section.items : [];

    state.start = {
      ...section,
      items: items.filter((item) => item.alignment === MENU.ALIGNMENT.START),
    };

    state.end = {
      ...section,
      items: items.filter((item) => item.alignment === MENU.ALIGNMENT.END),
    };

    listeners.forEach((cb) => cb());
    notify();
  },
  setAllMenu(sections: MenuSection[]) {
    state.allMenus = sections; // simpan semua menu
    notify();
  },
  getAllMenuItems(): MenuItem[] {
    const flatten = (items: MenuItem[]): MenuItem[] =>
      items.flatMap((item) =>
        item.type === MENU.TYPE.GROUP
          ? [item, ...flatten(item.items ?? [])]
          : [item]
      );

    return state.allMenus.flatMap((section) => flatten(section.items ?? []));
  },
  getSection(key: string): MenuSection | undefined {
    return state.allMenus.find((s) => s.id === key);
  },
  setPosition(pos: "top" | "bottom") {
    state.position = pos;
    notify();
  },
  setActivePath(path: number[]) {
    state.activePath = path;
    notify();
  },
  unsetActivePath() {
    state.activePath = [];
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
    if (current?.type === MENU.TYPE.GROUP) {
      items = current.items;
    } else {
      break;
    }
  }
  return items ?? [];
}
