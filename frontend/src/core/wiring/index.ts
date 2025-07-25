export * from "./wire";
export * from "./setupWiring";

import { menuWires } from "./menu.wires";
import { layoutWires } from "./layout.wires";
import { contentWires } from "./content.wires";
import { appWires } from "./app.wires";
import type { Wire } from "./setupWiring";
import { commandWires } from "./command.wires";

export const wiringMap: Wire[] = [
  ...menuWires(),
  ...commandWires(),
  ...layoutWires,
  ...contentWires,
  ...appWires,
];
