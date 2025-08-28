import { MENU } from "../constant";
import { SlidingPanelController } from "../SlidingPanel/controller";
import type { MenuBarEntry } from "../types";
import { MenuBarController } from "./controller";

export const handleClick = (entry: MenuBarEntry) => {
  const section = SlidingPanelController.getSection(entry.key);

  if (!section) return;

  const isAlreadyActive = MenuBarController.getActive() === entry.key;
  SlidingPanelController.setMenu(section);
  SlidingPanelController.unsetActivePath();

  switch (section.mode) {
    case MENU.MODE.SLIDING:
      if (isAlreadyActive) {
        SlidingPanelController.toggle();
        const isSlidingPanelVisible = SlidingPanelController.getVisibleState();
        !isSlidingPanelVisible && MenuBarController.setInActive();
      } else {
        MenuBarController.setActive(entry.key);
        SlidingPanelController.open();
      }
      break;
    case MENU.MODE.CONTEXT:
      //ContextMenusController.setMenu(section);
      break;
  }
};
