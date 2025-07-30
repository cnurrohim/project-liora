import { MenuProviderController } from "../../../controller/menuProviderController";
import { SlidingPanelController } from "../SlidingPanel/controller";
import type { MenuBarEntry } from "../types";
import { MenuBarController } from "./controller";

export const handleClick = (entry: MenuBarEntry) => {
  const section = MenuProviderController.getSection(entry.key);
  // console.log("Clicked section:", section?.id, "mode:", section?.mode);

  if (!section) return;

  const isAlreadyActive = MenuBarController.getActive() === entry.key;
  SlidingPanelController.setMenu(section);

  switch (section.mode) {
    case "sliding":
      if (isAlreadyActive) {
        SlidingPanelController.toggle();
        const isSlidingPanelVisible = SlidingPanelController.getVisibleState();
        console.log("isSlidingPanelVisible", isSlidingPanelVisible);
        !isSlidingPanelVisible && MenuBarController.setInActive();
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
