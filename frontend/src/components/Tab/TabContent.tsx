import { RouteRegistry } from "../../config/routeRegistry";
import { useController } from "../../hooks/useController";
import NoTabOpen from "../../pages/NoTabOpen";
import { TabController } from "./controller";

export default function TabContent() {
  const { openTabs, activeTabKey } = useController(TabController, (s) => ({
    openTabs: s.openTabs,
    activeTabKey: s.activeTabKey,
  }));

  const activeTab = openTabs.find((t) => t.key === activeTabKey);
  const content = (() => {
    if (!activeTab?.route) return <NoTabOpen />;
    return RouteRegistry.get(activeTab.route);
  })();

  return (
    <div className="flex-1 bg-gray-800 text-white overflow-auto">{content}</div>
  );
}
