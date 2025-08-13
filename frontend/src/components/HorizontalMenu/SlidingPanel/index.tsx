import { useEffect, useState, type ReactNode } from "react";
import { resolveItems, SlidingPanelController } from "./controller";
import { useController } from "../../../hooks/useController";
import type { MenuItem } from "../../../types/menu";
import MenuItemComponent from "./MenuItemComponent";

export default function SlidingPanel({
  onItemClick,
  iconRenderer,
  defaultIcon,
  onPinClick,
}: {
  onItemClick: (item: MenuItem) => void;
  iconRenderer?: (props: {
    name: ReactNode | string | undefined;
    size?: number;
    color?: string;
  }) => ReactNode;
  defaultIcon?: (props: { size?: number; color?: string }) => ReactNode;
  onPinClick?: (item: MenuItem) => void;
}) {
  const [state, setState] = useState(SlidingPanelController.getState());
  const visible = useController(SlidingPanelController, (s) => s.visible);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const update = () => setState(SlidingPanelController.getState());
    SlidingPanelController.subscribe(update);
    return () => SlidingPanelController.unsubscribe(update);
  }, []);

  const rawItems =
    searchQuery.trim() === ""
      ? [
          ...resolveItems(state.start, state.activePath),
          ...resolveItems(state.end, state.activePath),
        ]
      : SlidingPanelController.getAllMenuItems();

  const unFiltereditems = uniqueBy(rawItems, (item) => item.id);

  const items = unFiltereditems.filter((item) =>
    item.label?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        {/* Search Input */}
        <input
          type="text"
          placeholder="Search menu..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-3 p-2 rounded bg-gray-800 text-white focus:outline-none"
        />

        {state.start?.label && (
          <div className="text-sm uppercase text-gray-400 mb-2 px-1">
            {state.start.label}
          </div>
        )}
        <nav className="flex flex-row flex-wrap justify-between gap-x-6 overflow-auto px-1">
          {items.map((item, i) => (
            <MenuItemComponent
              key={i}
              state={state}
              item={item}
              i={i}
              onItemClick={onItemClick}
              iconRenderer={iconRenderer}
              defaultIcon={defaultIcon}
              onPinClick={onPinClick}
            />
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

function uniqueBy<T>(array: T[], keyFn: (item: T) => string | number) {
  const seen = new Set();
  return array.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
