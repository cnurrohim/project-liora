import DashboardViewerPage from "./DashboardViewerPage";
import DashboardEditorPage from "./DashboardEditorPage";
import { useDashboard } from "@/hooks/useDashboard";

export default function DashboardPage() {
  const { layout, mode, isLoading, setMode, save } = useDashboard();

  if (isLoading) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  if (mode === "viewer" && layout) {
    return (
      <DashboardViewerPage layout={layout} onEdit={() => setMode("editor")} />
    );
  }

  return (
    <DashboardEditorPage
      onSaved={(newLayout) => save(newLayout)}
      onView={() => setMode("viewer")}
    />
  );
}
