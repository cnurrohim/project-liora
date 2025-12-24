import { RouteRegistry } from "@/config/routeRegistry";
import { useController } from "@/hooks/useController";
import PagesNotFound from "@/pages/Misc/404";
import NoTabOpen from "@/pages/Misc/NoTabOpen";
import { TabController } from "./controller";

export default function TabContent() {
  const { openTabs, activeTabKey, defaultPage, contentMargin } = useController(
    TabController,
    (s) => ({
      openTabs: s.openTabs,
      activeTabKey: s.activeTabKey,
      defaultPage: s.defaultPage,
      contentMargin: s.contentMargin,
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
      className={`${contentMargin} flex-1 bg-(--content-surface) border-(--content-border) shadow-md overflow-auto p-5`}
    >
      {!content ? <PagesNotFound /> : content}
    </div>
  );
}
