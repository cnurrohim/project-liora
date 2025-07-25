import React, { type ReactNode } from "react";

export type LayoutState = {
  topPane: React.ReactNode | null;
  bottomPane: React.ReactNode | null;
  leftPane: React.ReactNode | null;
  rightPane: React.ReactNode | null;
  content: ReactNode | null;

  // Config mapping
  topPaneKey?: string;
  bottomPaneKey?: string;
  leftPaneKey?: string;
  rightPaneKey?: string;
};

const state: LayoutState = {
  topPane: null,
  bottomPane: null,
  leftPane: null,
  rightPane: null,
  content: null,

  topPaneKey: undefined,
  bottomPaneKey: undefined,
  leftPaneKey: undefined,
  rightPaneKey: undefined,
};

type PaneKey = Extract<
  keyof LayoutState,
  "topPane" | "bottomPane" | "leftPane" | "rightPane" | "content"
>;
export type LayoutKeyName =
  | "topPaneKey"
  | "bottomPaneKey"
  | "leftPaneKey"
  | "rightPaneKey";

let updateCallbacks: (() => void)[] = [];

export const LayoutController = {
  getState(): LayoutState {
    return { ...state };
  },

  setPane(pane: PaneKey, content: React.ReactNode | null) {
    state[pane] = content;
    notify();
  },

  setPaneKey(paneKey: LayoutKeyName, key: string | undefined) {
    state[paneKey] = key;
    notify();
  },

  subscribe(callback: () => void) {
    updateCallbacks.push(callback);
  },

  unsubscribe(callback: () => void) {
    updateCallbacks = updateCallbacks.filter((cb) => cb !== callback);
  },
};

function notify() {
  updateCallbacks.forEach((cb) => cb());
}
