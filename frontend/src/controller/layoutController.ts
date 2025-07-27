// src/controller/layoutController.ts
import type { ReactNode } from "react";

export type LayoutState = {
  topPane: ReactNode | null;
  bottomPane: ReactNode | null;
  leftPane: ReactNode | null;
  rightPane: ReactNode | null;
  content: ReactNode | null;

  topPaneKey?: string;
  bottomPaneKey?: string;
  leftPaneKey?: string;
  rightPaneKey?: string;
  contentKey?: string;
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
  contentKey: undefined,
};

type LayoutPosition =
  | "topPane"
  | "bottomPane"
  | "leftPane"
  | "rightPane"
  | "content";
type LayoutKeyName = `${LayoutPosition}Key`;

export type LayoutConfig = {
  leftPane: string | null;
  rightPane: string | null;
  topPane: string | null;
  bottomPane: string | null;
};

let isLayoutHydrated = false;

let updateCallbacks: (() => void)[] = [];

function notify() {
  updateCallbacks.forEach((cb) => cb());
}

export const LayoutController = {
  getState(): LayoutState {
    return { ...state };
  },

  setPane(pane: LayoutPosition, content: ReactNode | null) {
    state[pane] = content;
    notify();
  },

  setPaneKey(paneKey: LayoutKeyName, key: string | undefined) {
    state[paneKey] = key;
    notify();
  },

  updatePaneWithKey(
    pane: LayoutPosition,
    key: string | null,
    content: ReactNode | null
  ) {
    state[pane] = content;
    state[`${pane}Key` as LayoutKeyName] = key ?? undefined;
    notify();
  },

  clearComponentFromOtherPositions(
    currentPane: LayoutPosition,
    componentId: string
  ) {
    const layoutPositions: LayoutPosition[] = [
      "topPane",
      "bottomPane",
      "leftPane",
      "rightPane",
    ];
    for (const pos of layoutPositions) {
      if (pos !== currentPane && state[`${pos}Key`] === componentId) {
        state[pos] = null;
        state[`${pos}Key`] = undefined;
      }
    }
    notify();
  },

  markAsHydrated() {
    isLayoutHydrated = true;
  },

  isHydrated() {
    return isLayoutHydrated;
  },

  subscribe(callback: () => void) {
    updateCallbacks.push(callback);
  },

  unsubscribe(callback: () => void) {
    updateCallbacks = updateCallbacks.filter((cb) => cb !== callback);
  },
};
