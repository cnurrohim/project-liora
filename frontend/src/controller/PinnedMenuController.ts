import type { MenuItem } from "@/types/menu";
import { getPinnedMenus, pinMenu, unpinMenu } from "@/api/pinnedMenu.api";

let pinnedMenus: MenuItem[] = [];
let listeners: (() => void)[] = [];

export const PinnedMenuController = {
  async init() {
    try {
      const data = await getPinnedMenus();
      pinnedMenus = data;
      notify();
    } catch (err) {
      console.error("Gagal memuat pinned menus:", err);
    }
  },

  setPinnedMenus(menus: MenuItem[]) {
    pinnedMenus = menus;
    notify();
  },

  async addPinnedMenu(menu: MenuItem) {
    if (pinnedMenus.find((m) => m.id === menu.id)) {
      return;
    }

    // Optimistic update
    pinnedMenus.push(menu);
    notify();

    try {
      await pinMenu(menu.id);
    } catch (err) {
      console.error("Gagal menyimpan pinned menu:", err);
      // rollback
      pinnedMenus = pinnedMenus.filter((m) => m.id !== menu.id);
      notify();
    }
  },

  async removePinnedMenu(menuId: string) {
    // Optimistic update
    const oldMenus = [...pinnedMenus];
    pinnedMenus = pinnedMenus.filter((m) => m.id !== menuId);
    notify();

    try {
      await unpinMenu(menuId);
    } catch (err) {
      console.error("Gagal menghapus pinned menu:", err);
      // rollback
      pinnedMenus = oldMenus;
      notify();
    }
  },

  getPinnedMenus(): MenuItem[] {
    return [...pinnedMenus];
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
