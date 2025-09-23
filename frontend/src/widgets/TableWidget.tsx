import { WidgetContainer } from "./WidgetContainer";
import type { WidgetConfig } from "@/config/widgets";

export function TableWidget({
  config,
  width,
  data,
}: {
  config: WidgetConfig;
  width?: number;
  data: any;
}) {
  const headers =
    config.headers ?? (data?.rows?.[0] ? Object.keys(data.rows[0]) : []);
  const normalized = headers.map((h: any) =>
    typeof h === "string" ? { key: h, label: h } : h
  );

  return (
    <WidgetContainer config={config} width={width}>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            {normalized.map((h) => (
              <th
                key={h.key}
                className="border-b border-[var(--content-border)] px-2 py-1 text-left"
              >
                {h.label ?? h.key}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data?.rows?.map((row: any, idx: number) => (
            <tr key={idx}>
              {normalized.map((h) => (
                <td
                  key={h.key}
                  className="px-2 py-1 border-b border-[var(--content-border)]"
                >
                  {h.formatter ? h.formatter(row[h.key]) : row[h.key] ?? "-"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </WidgetContainer>
  );
}
