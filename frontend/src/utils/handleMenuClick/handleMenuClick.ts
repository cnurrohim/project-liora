import type { MenuAction, MenuItem } from "../../types/menu";
import { openRouteTab } from "./openRouteTab";
import { runCommand } from "./runCommand";

export function handleMenuClick(
  item: MenuItem | MenuAction,
  currentTabKey?: string
) {
  if (item.type === "route" && item.route) {
    openRouteTab(item, currentTabKey);
  } else if (item.type === "command" && item.command) {
    runCommand(item);
  }
}
