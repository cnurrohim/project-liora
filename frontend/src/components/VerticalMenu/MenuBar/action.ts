import { MenuProviderController } from "../../../controller/menuProviderController";
import { SlidingPanelController } from "../SlidingPanel/controller";
import type { MenuBarEntry } from "../types";
import { MenuBarController } from "./controller";

export const handleClick = (entry: MenuBarEntry) => {
  const section = MenuProviderController.getSection(entry.key);
  console.log("Clicked section:", section?.key, "mode:", section?.mode);

  if (!section) return;

  const isAlreadyActive = MenuBarController.getActive() === entry.key;

  switch (section.mode) {
    case "sliding":
      if (isAlreadyActive) {
        SlidingPanelController.toggle();
      } else {
        MenuBarController.setActive(entry.key);
        SlidingPanelController.setMenu(section);
      }
      break;
    case "context":
      //ContextMenusController.setMenu(section);
      break;
  }
};
