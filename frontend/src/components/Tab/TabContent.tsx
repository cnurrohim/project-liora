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
      className="flex-1 bg-[var(--foreground)] border-[var(--border)] border-1 shadow-md rounded-2xl overflow-auto m-1 p-5"
    >
      {!content ? <PagesNotFound /> : content}
    </div>
  );
}
