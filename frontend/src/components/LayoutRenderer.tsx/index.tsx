import { LayoutController } from "../../controller/layoutController";
import { useController } from "../../hooks/useController";
import EmptyPage from "../../pages/Misc/EmptyPage";

export function LayoutRenderer() {
  const layout = useController(LayoutController, (s) => ({
    leftPane: s.leftPane,
    rightPane: s.rightPane,
    topPane: s.topPane,
    bottomPane: s.bottomPane,
    content: s.content,
  }));

  return (
    <div className="flex flex-1 min-h-0 min-w-0">
      {layout.leftPane && (
        <div className="flex-shrink-0">{layout.leftPane}</div>
      )}

      <main id="mainContent" className="flex flex-col flex-1 min-w-0 h-full">
        {layout.topPane && <div className="w-full">{layout.topPane}</div>}
        {layout.content ?? <EmptyPage />}
        {layout.bottomPane && <div className="w-full">{layout.bottomPane}</div>}
      </main>

      {layout.rightPane && (
        <div className="flex-shrink-0">{layout.rightPane}</div>
      )}
    </div>
  );
}
