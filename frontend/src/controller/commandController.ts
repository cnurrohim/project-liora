import { createController } from "./controller";

export type CommandState = {
  command: string;
  payload?: any;
};

const base = createController<CommandState>({
  command: "",
  payload: undefined,
});

export const CommandController = {
  ...base,
  emit: (command: string, payload?: any) => {
    base.setState({ command, payload });
  },
  on: (command: string, callback: (payload?: any) => void) => {
    return base.subscribe(() => {
      const state = base.getState();
      if (state.command === command) {
        callback(state.payload);
      }
    });
  },
};
