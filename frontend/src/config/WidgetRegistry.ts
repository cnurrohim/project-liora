import { widgets, type WidgetConfig } from "@/config/widgets";

export const WidgetRegistry = {
  getAll(): WidgetConfig[] {
    return widgets;
  },

  getByKey(key: string): WidgetConfig | undefined {
    return widgets.find((w) => w.key === key);
  },

  getAllOptions() {
    return widgets.map((w) => ({
      value: w.key,
      label: w.label,
    }));
  },
};
