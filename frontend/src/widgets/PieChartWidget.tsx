import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { WidgetContainer } from "./WidgetContainer";
import type { WidgetConfig } from "@/config/widgets";

export function PieChartWidget({
  config,
  width,
  data,
}: {
  config: WidgetConfig;
  width?: number;
  data: any;
}) {
  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-(midAngle ?? 0) * RADIAN);
    const y = cy + radius * Math.sin(-(midAngle ?? 0) * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
      >
        {`${((percent ?? 1) * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <WidgetContainer config={config} width={width}>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data?.rows || []}
            dataKey={config.chart?.dataKey ?? "value"}
            nameKey={config.chart?.nameKey ?? "label"}
            label={renderCustomizedLabel}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
          >
            {(data?.rows || []).map((entry: any, idx: number) => (
              <Cell
                key={`cell-${entry[config.chart?.nameKey ?? "label"] ?? idx}`}
                fill={
                  config.chart?.colors?.[
                    idx % (config.chart?.colors?.length ?? 1)
                  ] ?? "#8884d8"
                }
              />
            ))}
          </Pie>
          {config.legend && <Legend />}
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </WidgetContainer>
  );
}
