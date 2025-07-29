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
  defaultIcon?: (props: { size?: number; color?: string }) => ReactNode;
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

  if (state.hidden) return;

  return (
    <aside
      className={`
    fixed top-0
    ${state.position === "left" ? "left-0" : "right-0"}
    h-full w-64 bg-gray-900 text-white shadow-lg
    transform transition-transform duration-300 z-20 flex flex-col 
    ${
      visible
        ? state.position === "left"
          ? "translate-x-0 ml-14 px-2"
          : "translate-x-0 mr-14 px-5"
        : state.position === "left"
        ? "-translate-x-full"
        : "translate-x-full"
    }
    ${!visible ? "pointer-events-none" : ""}
  `}
    >
      {/* Header */}
      <div className="flex items-center justify-between py-4 ">
        <div className="text-2xl font-bold text-rose-500 font-logo">
          {state.appName}
        </div>
        {/* <button
          className="text-xl text-gray-400 hover:text-white cursor-pointer"
          onClick={() => SlidingPanelController.close()}
          title="Close"
        >
          <div className="text-2xl mx-2 font-bold text-rose-500">×</div>
        </button> */}
      </div>

      <div className="flex flex-col h-full">
        <nav className=" overflow-auto flex flex-col">
          {state.start?.label && (
            <div className="font-primary text-md uppercase text-gray-400 font-bold mb-1">
              {state.start.label}
            </div>
          )}
          {items.map((item, i) => (
            <div
              key={i}
              className="group flex items-center cursor-pointer py-2 px-2 "
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
              <span className="text-gray-400 pr-3 group-hover:text-gray-100">
                {typeof item.icon === "string" && item.icon
                  ? iconRenderer?.({
                      name: item.icon,
                      size: 20,
                      color: item.icon_color,
                    })
                  : defaultIcon?.({
                      size: 20,
                      color: item.icon_color,
                    })}
              </span>

              <span className="text-sm text-gray-400 truncate group-hover:text-gray-100">
                {item.label}
              </span>
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
