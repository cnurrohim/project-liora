import { RouteRegistry } from "@/config/routeRegistry";
import { useController } from "@/hooks/useController";
import PagesNotFound from "@/pages/Misc/404";
import NoTabOpen from "@/pages/Misc/NoTabOpen";
import { TabController } from "./controller";

export default function TabContent() {
  const { openTabs, activeTabKey, defaultPage } = useController(
    TabController,
    (s) => ({
      openTabs: s.openTabs,
      activeTabKey: s.activeTabKey,
      defaultPage: s.defaultPage,
    })
  );

  console.log("here", defaultPage);

  const activeTab = openTabs.find((t) => t.key === activeTabKey);
  const content = (() => {
    const emptyTab = defaultPage ? (
      RouteRegistry.get(defaultPage)
    ) : (
      <NoTabOpen />
    );
    if (!activeTab?.route) return emptyTab;
    return RouteRegistry.get(activeTab.route);
  })();

  return (
    <div
      key={activeTab?.key}
      className="flex-1 bg-gray-800 text-white overflow-auto"
    >
      {!content ? <PagesNotFound /> : content}
    </div>
  );
}
