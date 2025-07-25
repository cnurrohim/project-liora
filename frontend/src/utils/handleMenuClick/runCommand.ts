import { ConfirmationDialogController } from "../../components/ConfirmationDialog/controller";
import { CommandController } from "../../controller/commandController";
import type { MenuAction } from "../../types/menu";

export function runCommand(item: MenuAction) {
  const command = item.command;

  if (!command) {
    console.warn("Command kosong/tidak valid:", item);
    return;
  }

  const commandsRequiringConfirmation: Record<string, string> = {
    logout: "Apakah anda yakin ingin logout?",
    // bisa ditambah: delete-all: "Yakin ingin hapus semua data?"
  };

  if (command in commandsRequiringConfirmation) {
    ConfirmationDialogController.askConfirmation(
      commandsRequiringConfirmation[command],
      () => {
        console.log("Running command:", command);
        CommandController.emit(command);
      }
    );
  } else {
    CommandController.emit(command);
  }
}
