import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { WidgetContainer } from "./WidgetContainer";
import type { WidgetConfig } from "@/config/widgets";

export function BarChartWidget({
  config,
  width,
  data,
}: {
  config: WidgetConfig;
  width?: number;
  data: any;
}) {
  return (
    <WidgetContainer config={config} width={width}>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data?.rows || []}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={config.bar?.nameKey} />
          <YAxis />
          <Tooltip />
          {config.legend && <Legend />}
          {Array.isArray(config.bar?.dataKey) ? (
            config.bar.dataKey.map((key, idx) => (
              <Bar
                key={key}
                dataKey={key}
                fill={
                  config.bar?.colors?.[
                    idx % (config.bar?.colors?.length ?? 1)
                  ] ?? "#8884d8"
                }
              />
            ))
          ) : (
            <Bar
              dataKey={config.bar?.dataKey ?? "value"}
              fill={config.bar?.colors?.[0] ?? "#8884d8"}
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    </WidgetContainer>
  );
}
