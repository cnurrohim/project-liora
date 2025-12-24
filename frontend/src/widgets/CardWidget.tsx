import { IconRenderer } from "@/components/IconRenderer";
import type { WidgetConfig, WidgetType } from "@/config/widgets";

export function CardWidget({
  config,
  width,
  data,
}: {
  config: WidgetConfig;
  width?: number;
  data: any;
}) {
  const fallbackWidth: Record<WidgetType, number> = {
    card: 3,
    table: 12,
    piechart: 6,
    barchart: 6,
  };

  return (
    <div
      className={`border rounded-2xl border-(--content-border) p-2`}
      style={{
        flex: width ?? config.defaultWidth ?? fallbackWidth[config.type],
      }}
    >
      <div className=" flex flex-row gap-2 items-center">
        <div
          className="p-0 text-(--content-text-muted) w-15 h-15 rounded-xl flex items-center justify-center"
          style={{
            backgroundColor: config.bgColor,
            color: config.textColor,
          }}
        >
          <IconRenderer name={config.icon} className="w-8 h-8" />
        </div>
        <div className="flex flex-col">
          <p className="font-bold text-4xl font-mono text-(--content-text)">
            {data?.total ?? "0"}
          </p>
          <h3 className="text-xs text-(--content-text-muted)">
            {config.label}
          </h3>
        </div>
      </div>
    </div>
  );
}
