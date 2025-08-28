export type MenuMode = "sliding" | "context"; // future: modal, etc.
export type MenuAlignment = "start" | "end";

export type MenuRoute = {
  id: string;
  type: "route";
  label: string;
  icon?: string;
  icon_color?: string;
  route: string;
  alignment?: MenuAlignment;
};

export type MenuCommand = {
  id: string;
  type: "command";
  label: string;
  icon?: string;
  icon_color?: string;
  command: string;
  alignment?: MenuAlignment;
};

export type MenuGroup = {
  id: string;
  type: "group";
  label: string;
  icon?: string;
  icon_color?: string;
  items: MenuItem[];
  alignment?: MenuAlignment;
};

export type MenuItem = MenuRoute | MenuCommand | MenuGroup;

export type MenuSection = {
  id: string;
  label?: string;
  description?: string;
  icon?: string;
  icon_color?: string;
  mode: MenuMode;
  alignment: MenuAlignment;
  items: (MenuItem | MenuAction)[];
};

export type MenuAction = MenuBase & {
  type: "command";
  command: string;
  alignment?: MenuAlignment;
};

export type MenuBase = {
  id: string;
  label: string;
  icon?: string;
};
