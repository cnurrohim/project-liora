import type { MenuMode, MenuAlignment } from "../../../types/menu";

export type MenuBarEntry = {
  key: string;
  label: string;
  icon: string;
  mode: MenuMode;
  alignment: MenuAlignment;
};
