import {
  getDashboardLayout,
  saveDashboardLayout,
} from "@/pages/Dashboard/dashboard.api";
import { getActiveUser } from "@/services/authServices";

let layout: { rows: any[] } | null = null;
let mode: "viewer" | "editor" = "viewer";
let isLoading = false;
let listeners: (() => void)[] = [];

export const DashboardController = {
  async init() {
    const user = getActiveUser();
    if (!user) return;

    isLoading = true;
    notify();

    try {
      const res = await getDashboardLayout(user.id, user.defaultRole.id);
      if (res?.rows && res.rows.length > 0) {
        layout = res;
        mode = "viewer";
      } else {
        layout = { rows: [] };
        mode = "editor";
      }
    } catch (err) {
      console.error("Gagal memuat dashboard:", err);
      layout = { rows: [] };
      mode = "editor";
    } finally {
      isLoading = false;
      notify();
    }
  },

  getLayout() {
    return layout;
  },

  getMode() {
    return mode;
  },

  isLoading() {
    return isLoading;
  },

  async save(newLayout: { rows: any[] }) {
    const user = getActiveUser();
    if (!user) return;

    try {
      await saveDashboardLayout(user.id, user.defaultRole.id, newLayout);
      layout = newLayout;
      mode = "viewer";
      notify();
    } catch (err) {
      console.error("Gagal menyimpan dashboard:", err);
    }
  },

  setMode(newMode: "viewer" | "editor") {
    mode = newMode;
    notify();
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
