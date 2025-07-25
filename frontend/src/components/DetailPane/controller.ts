// src/components/DetailPane/controller.ts

type Permission = {
  id: string;
  name: string;
  label: string;
  description: string;
};

export type DetailData = {
  id: string;
  name: string;
  description: string;
  permissions: Record<string, Permission[]>;
};

let state: {
  visible: boolean;
  data?: DetailData;
} = {
  visible: false,
  data: undefined,
};

let listeners: (() => void)[] = [];

export const DetailPaneController = {
  getState: () => state,

  subscribe(listener: () => void) {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },

  open(data: DetailData) {
    state = { visible: true, data };
    listeners.forEach((fn) => fn());
  },

  close() {
    state = { visible: false, data: undefined };
    listeners.forEach((fn) => fn());
  },
};
