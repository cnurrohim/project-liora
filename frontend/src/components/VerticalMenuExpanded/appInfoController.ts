let state = {
  name: "App" as string,
  logo: "" as string,
};

let listeners: (() => void)[] = [];

export const AppInfoController = {
  setAppInfo(name: string, logo: string) {
    state.name = name;
    state.logo = logo;
    notify();
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
