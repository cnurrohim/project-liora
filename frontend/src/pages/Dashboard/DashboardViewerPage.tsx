import { IconRenderer } from "@/components/IconRenderer";
import { getActiveUser } from "@/services/authServices";
import { WidgetRenderer } from "@/widgets/WidgetRenderer";
import { useEffect, useState } from "react";

export default function DashboardViewerPage({
  layout,
  onEdit,
}: {
  layout?: { rows: any[] }; // 👉 optional
  onEdit: () => void;
}) {
  if (!layout) {
    return <div className="p-6">No dashboard data.</div>;
  }

  const user = getActiveUser();

  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const updateGreeting = () => {
      const currentHour = new Date().getHours();

      if (currentHour >= 5 && currentHour < 12) {
        setGreeting("Good Morning");
      } else if (currentHour >= 12 && currentHour < 17) {
        setGreeting("Good Afternoon");
      } else if (currentHour >= 17 && currentHour < 21) {
        setGreeting("Have a lovely Evening");
      } else {
        setGreeting("Have a great night");
      }
    };

    updateGreeting(); // Call once to set the greeting
    const intervalId = setInterval(updateGreeting, 60000); // Update every minute

    return () => clearInterval(intervalId); // Clean up the interval on component unmount
  }, []);

  return (
    <div className="p-6 space-y-6">
      {user && (
        <div className="flex flex-col ">
          <div className="flex flex-row justify-between">
            <p className="text-sm font-bold text-(--content-text-muted) ">
              Welcome {user.name}
            </p>
            <button
              onClick={onEdit}
              className="px-1 border border-(--content-border) rounded text-(--content-text-muted) hover:text-(--content-text) hover:bg-(--content-surface-hover) cursor-pointer"
            >
              <IconRenderer name="RiEdit2Line" className="w-4 h-4" />
            </button>
          </div>
          <p className="text-2xl font-bold text-(--accent-primary) ">
            {greeting}
          </p>
        </div>
      )}

      {layout.rows.length === 0 ? (
        <p className="text-gray-500">No widgets configured.</p>
      ) : (
        layout.rows.map((row, rowIdx) => (
          <div key={rowIdx} className="flex gap-4">
            {row.columns.map((col: any, colIdx: number) => (
              <div key={colIdx} style={{ flex: col.width }}>
                {col.component && (
                  <WidgetRenderer widgetKey={col.component} width={col.width} />
                )}
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}
