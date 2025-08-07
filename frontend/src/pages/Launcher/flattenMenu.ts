import type { MenuSection, MenuItem } from "@/types/menu";

export type FlatMenuItem = {
  parent: string;
  label: string;
  icon?: string;
  icon_color?: string;
  type: "route" | "command";
  route?: string;
  command?: string;
};

export function flattenMenu(
  sections: MenuSection[],
  result: FlatMenuItem[] = []
): FlatMenuItem[] {
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
      // id: item.id,
      icon: item.icon ?? "⬘",
      icon_color: item.icon_color,
    };

    switch (item.type) {
      case "group":
        item.items?.forEach((child) => traverse(child, parentLabel));
        break;

      case "route":
        result.push({ ...base, type: "route", route: item.route });
        break;

      case "command":
        result.push({ ...base, type: "command", command: item.command });
        break;
    }
  }

  return result;
}
