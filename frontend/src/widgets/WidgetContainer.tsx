import { IconRenderer } from "@/components/IconRenderer";
import type { WidgetConfig, WidgetType } from "@/config/widgets";

export function WidgetContainer({
  config,
  width,
  children,
}: {
  config: WidgetConfig;
  width?: number;
  children: React.ReactNode;
}) {
  const fallbackWidth: Record<WidgetType, number> = {
    card: 3,
    table: 12,
    piechart: 6,
    barchart: 6,
  };

  return (
    <div
      className={`border rounded p-4 border-(--content-border)`}
      style={{
        flex: width ?? config.defaultWidth ?? fallbackWidth[config.type],
        backgroundColor: config.bgColor,
        color: config.textColor,
      }}
    >
      <h3 className="font-bold flex items-center gap-2 mb-4 text-(--content-text-muted)">
        <IconRenderer name={config.icon} className="w-4 h-4" /> {config.label}
      </h3>
      {children}
    </div>
  );
}
