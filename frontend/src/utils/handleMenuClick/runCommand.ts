import { ConfirmationDialogController } from "@/components/ConfirmationDialog/controller";
import { CommandController } from "@/controller/commandController";
import type { MenuAction } from "@/types/menu";

export function runCommand(item: MenuAction) {
  const command = item.command;

  if (!command) {
    console.warn("Empty/Invalid Command:", item);
    return;
  }

  const commandsRequiringConfirmation: Record<string, string> = {
    logout: "Are you sure you want to logout?",
  };

  if (command in commandsRequiringConfirmation) {
    ConfirmationDialogController.askConfirmation(
      commandsRequiringConfirmation[command],
      () => {
        CommandController.emit(command);
      }
    );
  } else {
    CommandController.emit(command);
  }
}
