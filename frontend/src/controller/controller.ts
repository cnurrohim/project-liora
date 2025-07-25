export function createController<T>(initialState: T) {
  let state = { ...initialState };
  let listeners: (() => void)[] = [];

  const getState = () => ({ ...state });

  const setState = (newState: Partial<T>) => {
    state = { ...state, ...newState };
    notify();
  };

  const subscribe = (cb: () => void) => {
    listeners.push(cb);
    return () => unsubscribe(cb); // return unsubscribe fn
  };

  const unsubscribe = (cb: () => void) => {
    listeners = listeners.filter((f) => f !== cb);
  };

  const notify = () => {
    listeners.forEach((cb) => cb());
  };

  return {
    getState,
    setState,
    subscribe,
    unsubscribe,
  };
}
