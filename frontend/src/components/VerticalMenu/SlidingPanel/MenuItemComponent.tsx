import type { ReactNode } from "react";
import { SlidingPanelController } from "./controller";
import { MENU } from "../constant";

export default function MenuItemComponent({
  state,
  item,
  i,
  onItemClick,
  iconRenderer,
  defaultIcon,
  onPinClick,
}: {
  state: any;
  item: any;
  i: number;
  onItemClick: (item: any) => void;
  iconRenderer?: (props: {
    name: ReactNode | string | undefined;
    size?: number;
    color?: string;
  }) => ReactNode;
  defaultIcon?: (props: { size?: number; color?: string }) => React.ReactNode;
  onPinClick?: (item: any) => void;
}) {
  return (
    <div className="flex flex-row items-center cursor-pointer transition group">
      <div
        key={i}
        className="flex flex-1 items-center text-(--vertical-secondary-text) 
                          hover:text-(--vertical-secondary-text-hover) 
                          hover:bg-(--accent-primary)  pl-2 py-2 rounded-md"
        onClick={() => {
          if (item.type === MENU.TYPE.GROUP) {
            SlidingPanelController.setActivePath([...state.activePath, i]);
          }

          if (item.type === MENU.TYPE.ROUTE) {
            SlidingPanelController.close();
          }

          onItemClick(item);
        }}
      >
        <span className="rounded mr-2">
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

        <span className="font-semibold text-sm truncate">{item.label}</span>

        {item.type === "group" && <span className="ml-auto  pr-3">⮯</span>}
      </div>

      {/* RIGHT: Pin Button */}
      {item.type !== "group" && onPinClick && (
        <button
          type="button"
          title={item.isPinned ? "Unpin menu" : "Pin menu"}
          className="text-(--vertical-secondary-text) hover:bg-(--accent-primary) hover:text-(--vertical-secondary-text-hover)  p-2 rounded cursor-pointer"
          onClick={() => onPinClick(item)}
        >
          {iconRenderer?.({
            name: item.isPinned ? "RiPushpin2Fill" : "RiPushpin2Line",
            size: 15,
            color: "",
          })}
        </button>
      )}
    </div>
  );
}
