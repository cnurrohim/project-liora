// src/utils/menuHelpers.ts
import type { MenuItem, MenuRoute, MenuCommand } from "../types/menu";

export function flattenItems(items: MenuItem[]): (MenuRoute | MenuCommand)[] {
  return items.flatMap((item) => {
    if (item.type === "group") {
      return flattenItems(item.items);
    }
    return item;
  });
}
