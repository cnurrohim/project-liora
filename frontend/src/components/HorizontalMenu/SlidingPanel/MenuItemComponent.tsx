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
    <div className="flex flex-row ">
      <div
        key={i}
        className="group flex items-center gap-2  hover:bg-[var(--background)] cursor-pointer p-2 rounded w-48"
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
        <span className="text-[var(--panel-text-primary)] group-hover:text-[var(--text-primary)]">
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

        <span className="font-semibold text-sm text-[var(--panel-text-primary)] group-hover:text-[var(--text-primary)] flex-1 truncate">
          {item.label}
        </span>
      </div>
      {item.type !== "group" && onPinClick && (
        <button
          type="button"
          className="ml-auto text-[var(--panel-text-primary)] cursor-pointer hover:bg-gray-700 hover:text-[var(--text-primary)] p-2"
          title={item.isPinned ? "Unpin menu" : "Pin menu"}
          onClick={() => {
            onPinClick(item);
          }}
        >
          {iconRenderer?.({
            name: item.isPinned ? "RiPushpin2Fill" : "RiPushpin2Line",
            size: 15,
            color: "",
          })}
        </button>
      )}

      {item.type === "group" && (
        <span className="ml-auto text-gray-500 p-2">
          {iconRenderer?.({
            name: "RiArrowDownDoubleLine",
            size: 20,
          })}
        </span>
      )}
    </div>
  );
}
