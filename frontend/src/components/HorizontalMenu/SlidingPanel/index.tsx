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

  if (state.hidden) return;
  return (
    <aside
      className={`
    fixed
    ${state.position === "top" ? "top-0" : "bottom-0"}
    h-64 w-full bg-gray-900 text-white shadow-lg
    transform transition-transform duration-300 z-40 flex flex-row px-2
    ${
      visible
        ? state.position === "top"
          ? "translate-y-0 mt-10"
          : "translate-y-0 mt-10"
        : state.position === "top"
        ? "-translate-y-full"
        : "translate-y-full"
    }
    ${!visible ? "pointer-events-none" : ""}
  `}
    >
      {/* Header */}
      <div className=" ml-2 mr-5 mt-3">
        <button
          className=" text-xl text-gray-400 bg-rose-500 hover:text-white cursor-pointer"
          onClick={() => SlidingPanelController.close()}
          title="Close"
        >
          <div className="text-2xl mx-2 font-bold text-gray-900">×</div>
        </button>
      </div>

      <div className="flex flex-col w-full mt-2">
        {state.start?.label && (
          <div className="text-sm uppercase text-gray-400 mb-2 px-1">
            {state.start.label}
          </div>
        )}
        <nav className="flex flex-row flex-wrap justify-start gap-x-6 overflow-auto px-1">
          {items.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-2  hover:bg-gray-800 cursor-pointer p-2 rounded w-48"
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
                  : defaultIcon
                  ? defaultIcon
                  : "*"}
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
