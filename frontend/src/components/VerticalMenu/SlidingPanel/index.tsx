import { useEffect, useState, type ReactNode } from "react";
import { resolveItems, SlidingPanelController } from "./controller";
import { useController } from "../../../hooks/useController";
import type { MenuItem } from "../../../types/menu";

export default function SlidingPanel({
  onItemClick,
  iconRenderer,
  defaultIcon,
}: {
  onItemClick: (item: MenuItem) => void;
  iconRenderer?: (props: {
    name: ReactNode | string | undefined;
    size?: number;
    color?: string;
  }) => ReactNode;
  defaultIcon?: ReactNode | string;
}) {
  const [state, setState] = useState(SlidingPanelController.getState());
  const visible = useController(SlidingPanelController, (s) => s.visible);

  useEffect(() => {
    const update = () => setState(SlidingPanelController.getState());
    SlidingPanelController.subscribe(update);
    return () => SlidingPanelController.unsubscribe(update);
  }, []);

  const section = state.start;
  const items = resolveItems(section, state.activePath);

  return (
    <aside
      className={`
    fixed top-0
    ${state.position === "left" ? "left-0" : "right-0"}
    h-full w-64 bg-gray-900 text-white shadow-lg
    transform transition-transform duration-300 z-20 flex flex-col px-2
    ${
      visible
        ? state.position === "left"
          ? "translate-x-0 ml-14"
          : "translate-x-0 mr-14"
        : state.position === "left"
        ? "-translate-x-full"
        : "translate-x-full"
    }
    ${!visible ? "pointer-events-none" : ""}
  `}
    >
      {/* Header */}
      <div className="flex items-center justify-between py-1">
        <div className="text-2xl font-bold text-rose-500">{state.appName}</div>
        <button
          className="text-xl text-gray-400 hover:text-white cursor-pointer"
          onClick={() => SlidingPanelController.close()}
          title="Close"
        >
          <div className="text-2xl mx-2 font-bold text-rose-500">×</div>
        </button>
      </div>

      <div className="flex flex-col h-full mt-2">
        <nav className=" overflow-auto">
          {state.start?.label && (
            <div className="text-sm uppercase text-gray-400 mb-1">
              {state.start.label}
            </div>
          )}
          {items.map((item, i) => (
            <div
              key={i}
              className="flex items-center pr-3 hover:bg-gray-700 cursor-pointer "
              onClick={() => {
                if (item.type === "group") {
                  SlidingPanelController.setActivePath([
                    ...state.activePath,
                    i,
                  ]);
                }

                if (item.type === "route") {
                  SlidingPanelController.close();
                }

                onItemClick(item);
              }}
            >
              <span className="text-gray-300 pr-2">
                {typeof item.icon === "string" && item.icon
                  ? iconRenderer?.({
                      name: item.icon,
                      size: 15,
                      color: item.icon_color,
                    })
                  : defaultIcon}
              </span>

              <span className="text-gray-300 truncate">{item.label}</span>
              {item.type === "group" && (
                <span className="ml-auto text-rose-400">⮯</span>
              )}
            </div>
          ))}
        </nav>

        {state.activePath.length > 0 && (
          <div className="mt-4 border-t border-lime-700 pt-2 ">
            <div
              onClick={() => SlidingPanelController.goBack()}
              className="text-gray-400 hover:text-white cursor-pointer "
            >
              <span className="ml-auto text-rose-400 pr-2">⮬</span>
              <span className="text-gray-400">Back</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
