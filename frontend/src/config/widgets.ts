export type WidgetType = "card" | "table" | "piechart" | "barchart";

export type TableHeader =
  | string
  | {
      key: string;
      label?: string;
      formatter?: (value: any) => string;
    };

export type ChartConfig = {
  dataKey: string;
  nameKey?: string;
  colors?: string[];
};

export type BarConfig = {
  dataKey: string | string[];
  nameKey?: string;
  colors?: string[];
};

export type WidgetConfig = {
  key: string;
  label: string;
  icon: string;
  type: WidgetType;
  datasource: string; // endpoint API
  defaultWidth?: number;
  headers?: TableHeader[];
  chart?: ChartConfig;
  bar?: BarConfig;
  legend?: boolean;
  bgColor?: string;
  textColor?: string;
};

export const widgets: WidgetConfig[] = [
  // === CARD WIDGETS ===
  {
    key: "totalItems",
    label: "Total Items",
    icon: "RiBox2Line",
    type: "card",
    datasource: "/widgets/total-items",
    defaultWidth: 4,
    bgColor: "#c5e38e",
    textColor: "#666565",
  },
  {
    key: "lowStock",
    label: "Low Stock Alert",
    icon: "RiAlertFill",
    type: "card",
    datasource: "/widgets/low-stock",
    defaultWidth: 4,
    bgColor: "#ffdd8c",
    textColor: "#666565",
  },
  {
    key: "openPO",
    label: "Open Purchase Orders",
    icon: "RiClipboardLine",
    type: "card",
    datasource: "/widgets/open-po",
    defaultWidth: 4,
    bgColor: "#a8dddf",
    textColor: "#666565",
  },

  // === TABLE WIDGETS ===
  {
    key: "recentGR",
    label: "Recent Goods Receipt",
    icon: "RiSurveyFill",
    type: "table",
    datasource: "/widgets/recent-gr",
    headers: [
      { key: "receipt_number", label: "GR No" },
      { key: "supplier", label: "Supplier" },
      {
        key: "receipt_date",
        label: "Date",
        formatter: (v) =>
          new Date(v).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
      },
    ],
    defaultWidth: 12,
  },

  {
    key: "recentGI",
    label: "Recent Goods Issue",
    icon: "RiSurveyFill",
    type: "table",
    datasource: "/widgets/recent-gi",
    headers: [
      { key: "issue_number", label: "Issue No." },
      {
        key: "issue_date",
        label: "Date",
        formatter: (v) =>
          new Date(v).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
      },
      { key: "name", label: "Item" },
      { key: "quantity", label: "Qty" },
      { key: "source", label: "Transfered From" },
      { key: "destination", label: "Transfered to" },
    ],
    defaultWidth: 12,
  },

  // === CHART WIDGETS ===
  {
    key: "monthlyFlow",
    label: "Monthly Flow",
    icon: "RiBarChart2Fill",
    type: "barchart",
    datasource: "/widgets/monthly-flow",
    bar: {
      dataKey: ["inbound", "outbound"],
      nameKey: "month",
      colors: ["#82ca9d", "#8884d8"],
    },
    legend: true,
    defaultWidth: 12,
  },
  {
    key: "stockByLocation",
    label: "Stock by Location",
    icon: "RiPieChart2Fill",
    type: "piechart",
    datasource: "/widgets/stock-by-location",
    chart: {
      dataKey: "value",
      nameKey: "label",
      colors: ["#82ca9d", "#8884d8", "#ffc658", "#ff7f50"],
    },
    legend: true,
    defaultWidth: 6,
  },
  {
    key: "fastMoving",
    label: "Fast Moving Items",
    icon: "RiBarChart2Fill",
    type: "barchart",
    datasource: "/widgets/fast-moving",
    bar: {
      dataKey: "moved_qty",
      nameKey: "item",
    },
    legend: false,
    defaultWidth: 6,
  },
];
