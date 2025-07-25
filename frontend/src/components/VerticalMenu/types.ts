// src/components/Sidebar/types.ts

import type { ReactNode } from "react";
import type { MenuMode, MenuAlignment } from "../../types/menu";

/**
 * MenuBarEntry digunakan oleh MenuBar untuk menampilkan
 * daftar ikon berdasarkan section.
 */
export interface MenuBarEntry {
  key: string;
  label: string;
  icon?: ReactNode;
  mode: MenuMode;
  alignment: MenuAlignment;
}
