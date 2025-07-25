import { CommandRegistry } from "../../config/commandRegistry";
import { CommandController } from "../../controller/commandController";
import type { Wire } from "../../core/wiring";
import { logout } from "../../utils/auth";

export function commandWires(): Wire[] {
  CommandRegistry.register("logout", "logout current user");
  CommandRegistry.register("switch-role", "switch to another account");

  return [
    {
      from: (handler: () => void) => CommandController.on("logout", handler),
      to: () => logout(),
    },
    {
      from: (handler: (payload: { roleId: string }) => void) =>
        CommandController.on("switch-role", handler),
      to: (payload: { roleId: string }) => {
        console.log("Switching to role:", payload.roleId);
        // implement logic
      },
    },
  ];
}
