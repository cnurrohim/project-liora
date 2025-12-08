type Command = {
  name: string;
  label: string;
};

const listCommand: Command[] = [];

export const CommandRegistry = (() => {
  return {
    register(name: string, label: string) {
      const exists = listCommand.some((c) => c.name === name);
      if (!exists) {
        listCommand.push({ name, label });
      }
    },

    getAll(): Command[] {
      return [...listCommand];
    },

    getOptions(): { value: string; label: string }[] {
      return listCommand.map((c) => ({
        value: c.name,
        label: c.label,
      }));
    },
  };
})();
