import { MenuProviderController } from "../../../controller/menuProviderController";
import { SlidingPanelController } from "../SlidingPanel/controller";
import type { MenuBarEntry } from "../types";
import { MenuBarController } from "./controller";

export const handleClick = (entry: MenuBarEntry) => {
  const section = MenuProviderController.getSection(entry.key);

  if (!section) return;

  const isAlreadyActive = MenuBarController.getActive() === entry.key;
  SlidingPanelController.setMenu(section);

  switch (section.mode) {
    case "sliding":
      if (isAlreadyActive) {
        SlidingPanelController.toggle();
      } else {
        MenuBarController.setActive(entry.key);
        SlidingPanelController.open();
      }
      break;
    case "context":
      //ContextMenusController.setMenu(section);
      break;
  }
};
