export type TabItem = {
  key: string; // ID unik tab
  label: string; // Nama tab yang tampil
  route?: string; // Untuk routing (opsional)
  content: React.ReactNode; // JSX untuk isi tab
};

type DefaultPageState = {
  page: TabItem | null;
};

const state: DefaultPageState = {
  page: null,
};

let updateCallbacks: (() => void)[] = [];

export const DefaultPageController = {
  setDefaultPage(tab: TabItem) {
    state.page = tab;
    notify();
  },

  getDefaultPage(): TabItem | null {
    return state.page;
  },

  clear() {
    state.page = null;
    notify();
  },

  getState(): DefaultPageState {
    return { ...state };
  },

  subscribe(cb: () => void) {
    updateCallbacks.push(cb);
  },

  unsubscribe(cb: () => void) {
    updateCallbacks = updateCallbacks.filter((fn) => fn !== cb);
  },
};

function notify() {
  updateCallbacks.forEach((cb) => cb());
}
