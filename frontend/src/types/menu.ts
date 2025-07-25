// src/types/menu.ts
export type MenuMode = "sliding" | "context"; // future: modal, etc.
export type MenuAlignment = "start" | "end";

export type MenuRoute = {
  // id: string;
  type: "route";
  label: string;
  icon?: React.ReactNode | string;
  icon_color?: string;
  route: string;
};

export type MenuCommand = {
  // id: string;
  type: "command";
  label: string;
  icon?: React.ReactNode | string;
  icon_color?: string;
  command: string;
};

export type MenuGroup = {
  // id: string;
  type: "group";
  label: string;
  icon?: React.ReactNode | string;
  icon_color?: string;
  items: MenuItem[];
};

export type MenuItem = MenuRoute | MenuCommand | MenuGroup;

export type MenuSection = {
  id: string;
  label?: string;
  icon?: React.ReactNode | string;
  icon_color?: string;
  mode: MenuMode;
  alignment: MenuAlignment;
  items: (MenuItem | MenuAction)[];
};

export type MenuAction = MenuBase & {
  type: "command";
  command: string;
};

export type MenuBase = {
  // id: string;
  label: string;
  icon?: React.ReactNode | string;
};
