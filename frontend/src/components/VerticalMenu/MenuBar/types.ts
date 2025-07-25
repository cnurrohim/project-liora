import type { ReactNode } from "react";
import type { MenuMode, MenuAlignment } from "../../../types/menu";

export type MenuBarEntry = {
  key: string;
  label: string;
  icon?: ReactNode;
  mode: MenuMode;
  alignment: MenuAlignment;
};
