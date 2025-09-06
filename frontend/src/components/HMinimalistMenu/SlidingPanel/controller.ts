import type { MenuItem, MenuSection } from "../../../types/menu";
import { MENU } from "../constant";

let state = {
  start: null as MenuSection | null,
  end: null as MenuSection | null,
  visible: false as boolean,
  activePath: [] as number[],
  position: "top" as "top" | "bottom",
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
    state.allMenus = sections; // Save semua menu
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
  goBack() {
    state.activePath = state.activePath.slice(0, -1);
    notify();
  },
  getVisibleState() {
    return state.visible;
  },
  toggle() {
    if (state.visible) {
      // Tutup
      state.visible = false;
      notify();
      setTimeout(() => {
        state.hidden = true;
        notify();
      }, 300); // sesuai duration-300
    } else {
      // Buka
      state.hidden = false;
      notify();
      requestAnimationFrame(() => {
        state.visible = true;
        notify();
      });
    }
  },

  close() {
    state.visible = false;
    notify();
    setTimeout(() => {
      state.hidden = true;
      notify();
    }, 300);
  },

  open() {
    state.hidden = false;
    notify();
    requestAnimationFrame(() => {
      state.visible = true;
      notify();
    });
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
