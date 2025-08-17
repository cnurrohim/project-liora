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
        className="group flex w-full items-center gap-4 cursor-pointer px-2 py-2 rounded-md hover:bg-gray-800 transition"
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
        <span className="text-gray-400 group-hover:text-white">
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

        <span className="font-semibold text-sm text-gray-400 group-hover:text-white flex-1 truncate">
          {item.label}
        </span>

        {item.type === "group" && (
          <span className="ml-auto bg-gray-950 pr-1">⮯</span>
        )}
      </div>
      {item.type !== "group" && onPinClick && (
        <button
          type="button"
          title={item.isPinned ? "Unpin menu" : "Pin menu"}
          className="ml-auto text-gray-400 cursor-pointer hover:bg-gray-700 hover:text-white p-2"
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
    </div>
  );
}
