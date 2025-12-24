import { useEffect, useState } from "react";
import { apiFetch } from "@/utils/apiFetch";
import { WidgetRegistry } from "@/config/WidgetRegistry";
import { CardWidget } from "./CardWidget";
import { TableWidget } from "./TableWidget";
import { PieChartWidget } from "./PieChartWidget";
import { BarChartWidget } from "./BarChartWidget";

export function WidgetRenderer({
  widgetKey,
  width,
}: {
  widgetKey: string;
  width?: number;
}) {
  const config = WidgetRegistry.getByKey(widgetKey);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!config) return;
    setLoading(true);
    setError(null);

    apiFetch(config.datasource)
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch(() => setError("Failed to load data"))
      .finally(() => setLoading(false));
  }, [config]);

  if (!config)
    return (
      <div className="border border-(--content-border) rounded p-4 bg-red-100">
        Unknown widget: {widgetKey}
      </div>
    );
  if (loading) return <div className="p-4">Loading {config.label}...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  switch (config.type) {
    case "card":
      return <CardWidget config={config} width={width} data={data} />;
    case "table":
      return <TableWidget config={config} width={width} data={data} />;
    case "piechart":
      return <PieChartWidget config={config} width={width} data={data} />;
    case "barchart":
      return <BarChartWidget config={config} width={width} data={data} />;
    default:
      return <div>Unsupported widget type: {config.type}</div>;
  }
}
