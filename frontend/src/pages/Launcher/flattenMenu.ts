import { PinnedMenuController } from "@/controller/PinnedMenuController";
import type { MenuSection, MenuItem } from "@/types/menu";

export type FlatMenuItem = {
  id: string;
  parent: string;
  label: string;
  icon?: string;
  icon_color?: string;
  type: "route" | "command";
  route?: string;
  command?: string;
  isPinned: boolean; // selalu ada, default false
  original: MenuItem;
};

export function flattenMenu(
  sections: MenuSection[],
  result: FlatMenuItem[] = []
): FlatMenuItem[] {
  // Ambil daftar ID menu yang sudah dipin
  const pinnedIds = new Set(
    PinnedMenuController.getPinnedMenus().map((m: MenuItem) => m.id)
  );

  for (const section of sections) {
    const parentLabel = section.label ?? section.id ?? "Untitled";

    if (Array.isArray(section.items)) {
      for (const item of section.items) {
        traverse(item, parentLabel);
      }
    }
  }

  function traverse(item: MenuItem, parentLabel: string) {
    const base = {
      parent: parentLabel,
      label: item.label,
      id: item.id,
      icon: item.icon ?? "⬘",
      icon_color: item.icon_color,
      isPinned: pinnedIds.has(item.id!), // cek apakah sudah dipin
    };

    switch (item.type) {
      case "group":
        item.items?.forEach((child) => traverse(child, parentLabel));
        break;

      case "route":
        result.push({
          ...base,
          type: "route",
          route: item.route,
          original: item,
        });
        break;

      case "command":
        result.push({
          ...base,
          type: "command",
          command: item.command,
          original: item,
        });
        break;
    }
  }

  return result;
}
