type ConfirmationState = {
  message: string;
  onConfirm: () => void;
  visible: boolean;
};

let state: ConfirmationState = {
  message: "",
  onConfirm: () => {},
  visible: false,
};

let cachedSnapshot = { ...state };
let listeners: (() => void)[] = [];

export const ConfirmationDialogController = {
  getState() {
    return cachedSnapshot;
  },

  closeConfirmation() {
    state.visible = false;
    notify();
  },

  askConfirmation(message: string, onConfirm: () => void) {
    state = {
      message,
      onConfirm,
      visible: true,
    };
    notify();
  },

  setState(newState: Partial<ConfirmationState>) {
    state = { ...state, ...newState };
    notify();
  },

  subscribe(callback: () => void) {
    listeners.push(callback);
    return () => {
      listeners = listeners.filter((cb) => cb !== callback);
    };
  },
};

function notify() {
  cachedSnapshot = { ...state };
  listeners.forEach((cb) => cb());
}
