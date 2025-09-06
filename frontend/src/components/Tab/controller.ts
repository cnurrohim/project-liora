export type TabItem = {
  key: string;
  label: string;
  route?: string;
  icon?: string;
  content?: React.ReactNode;
};

type TabStorageKey = {
  userId?: string;
  roleId?: string;
};

export type TabState = {
  openTabs: TabItem[];
  activeTabKey: string | null;
  tabStorageKey?: TabStorageKey;
  defaultPage: string | null;
  contentMargin: string;
};

const state: TabState = {
  openTabs: [],
  activeTabKey: null,
  tabStorageKey: {},
  defaultPage: null,
  contentMargin: "",
};

let updateCallbacks: (() => void)[] = [];

type TabHistoryItem = TabItem;

const tabHistory: TabHistoryItem[] = [];

export const TabController = {
  getState(): TabState {
    return { ...state };
  },

  isTemporaryTab(key: string) {
    return key.startsWith("tab-");
  },

  getActiveTabKey(): string | null {
    return state.activeTabKey;
  },

  replaceTab(oldKey: string, newTab: TabItem) {
    const index = state.openTabs.findIndex((t) => t.key === oldKey);
    if (index !== -1) {
      // Replace tab
      state.openTabs[index] = newTab;
      state.activeTabKey = newTab.key;
      notify();
    }
  },

  openTab(tab: TabItem, newTab: boolean = false) {
    if (newTab) {
      this.openNewTab(tab);
      return;
    }

    this.openTabWithoutDuplicate(tab);
  },

  openTabWithoutDuplicate(tab: TabItem) {
    const exists = state.openTabs.find((t) => t.key === tab.key);
    if (!exists) {
      state.openTabs.push(tab);
    }
    state.activeTabKey = tab.key;
    notify();
  },

  replaceTabWithBackStack(newTab: TabItem) {
    const activeKey = state.activeTabKey;
    if (activeKey) {
      const currentTab = state.openTabs.find((t) => t.key === activeKey);
      if (currentTab) {
        tabHistory.push({ ...currentTab }); // Save seluruh tab
      }
    }

    // replace seperti biasa
    const index = state.openTabs.findIndex((t) => t.key === activeKey);
    if (index !== -1) {
      state.openTabs[index] = newTab;
    } else {
      state.openTabs.push(newTab);
    }
    state.activeTabKey = newTab.key;
    notify();
  },

  goBackInTabStack() {
    const lastTab = tabHistory.pop();
    if (!lastTab) return;

    const index = state.openTabs.findIndex((t) => t.key === lastTab.key);
    if (index !== -1) {
      state.openTabs[index] = lastTab;
    } else {
      state.openTabs.push(lastTab);
    }
    state.activeTabKey = lastTab.key;
    notify();
  },
  closeRightOf(tabKey: string) {
    const index = state.openTabs.findIndex((t) => t.key === tabKey);
    if (index === -1) return;

    state.openTabs = state.openTabs.filter((_, i) => i <= index);
    notify();
  },

  closeLeftOf(tabKey: string) {
    const index = state.openTabs.findIndex((t) => t.key === tabKey);
    if (index === -1) return;

    state.openTabs = state.openTabs.filter((_, i) => i >= index);
    notify();
  },

  openNewTab(tab: TabItem) {
    const uniqueTab = {
      ...tab,
      key: `${tab.key}-${Date.now()}`,
    };
    state.openTabs.push(uniqueTab);
    state.activeTabKey = uniqueTab.key;
    notify();
  },

  replaceOrOpenTab(tab: TabItem) {
    const exists = state.openTabs.find((t) => t.key === tab.key);
    if (exists) {
      const index = state.openTabs.findIndex((t) => t.key === tab.key);
      state.openTabs[index] = tab; // replace
      state.activeTabKey = tab.key;
    } else {
      state.openTabs.push(tab);
      state.activeTabKey = tab.key;
    }
    notify();
  },

  closeOthers(tabKey: string) {
    const target = state.openTabs.find((t) => t.key === tabKey);
    if (!target) return;

    state.openTabs = [target];
    state.activeTabKey = tabKey;
    notify();
  },

  closeTab(tabKey: string) {
    state.openTabs = state.openTabs.filter((t) => t.key !== tabKey);
    if (state.activeTabKey === tabKey) {
      state.activeTabKey =
        state.openTabs[state.openTabs.length - 1]?.key || null;
    }
    notify();
  },

  setActiveTab(tabKey: string) {
    if (state.openTabs.some((t) => t.key === tabKey)) {
      state.activeTabKey = tabKey;
      notify();
    }
  },

  setTabStorageKey(userId: string, roleId: string) {
    state.tabStorageKey = state.tabStorageKey ?? {};
    state.tabStorageKey.userId = userId;
    state.tabStorageKey.roleId = roleId;
  },

  getTabStorageKey() {
    const tabStorageKey = state.tabStorageKey ?? {};
    if (!tabStorageKey?.userId && !tabStorageKey?.roleId)
      return "tabState:guest";
    return `tabState:${tabStorageKey.userId}:${tabStorageKey.roleId}`;
  },

  getTabByRoute(route: string): TabItem | undefined {
    return state.openTabs.find((tab) => tab.route === route);
  },

  setDefaultPage(defaultPage: string | null) {
    state.defaultPage = defaultPage;
  },

  setContentMargin(margin: {
    hasTop?: boolean;
    hasBottom?: boolean;
    hasLeft?: boolean;
    hasRight?: boolean;
  }) {
    const margins = [
      margin.hasTop && margin.hasLeft ? "rounded-tl-2xl" : "",
      margin.hasTop && margin.hasRight ? "rounded-tr-2xl" : "",
      margin.hasBottom && margin.hasRight ? "rounded-br-2xl" : "",
      margin.hasBottom && margin.hasLeft ? "rounded-bl-2xl" : "",
    ].join(" ");

    state.contentMargin = margins;
    notify();
  },

  getContentMargin() {
    return state.contentMargin;
  },

  subscribe(cb: () => void) {
    updateCallbacks.push(cb);
  },

  unsubscribe(cb: () => void) {
    updateCallbacks = updateCallbacks.filter((fn) => fn !== cb);
  },
};

function notify() {
  const openTabsForStorage = state.openTabs.map(
    ({ key, label, route, icon }) => ({
      key,
      label,
      route,
      icon,
    })
  );

  localStorage.setItem(
    TabController.getTabStorageKey(),
    JSON.stringify({
      openTabs: openTabsForStorage,
      activeTabKey: state.activeTabKey,
    })
  );

  updateCallbacks.forEach((cb) => cb());
}

export function initFromStorage() {
  const saved = localStorage.getItem(TabController.getTabStorageKey());

  if (!saved) return;

  try {
    const parsed = JSON.parse(saved) as TabState;

    // Rebuild content secara manual (pakai key/route)
    const rebuiltTabs = parsed.openTabs;

    state.openTabs = rebuiltTabs;
    state.activeTabKey = parsed.activeTabKey;
    notify();
  } catch (e) {
    console.warn("Gagal restore tab state:", e);
  }
}
