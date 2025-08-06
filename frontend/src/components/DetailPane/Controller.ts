// src/components/DetailPane/createDetailPaneController.ts

import { useSyncExternalStore } from "react";

export type DetailPaneState<T> = {
  visible: boolean;
  data?: T;
};

export function Controller<T>() {
  let state: DetailPaneState<T> = {
    visible: false,
    data: undefined,
  };

  let listeners: (() => void)[] = [];

  const subscribe = (listener: () => void) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  };

  const getState = () => state;

  const open = (data: T) => {
    state = { visible: true, data };
    listeners.forEach((l) => l());
  };

  const close = () => {
    state = { visible: false, data: undefined };
    listeners.forEach((l) => l());
  };

  const useDetailPane = () =>
    useSyncExternalStore(subscribe, getState) as DetailPaneState<T>;

  return {
    open,
    close,
    useDetailPane,
  };
}
