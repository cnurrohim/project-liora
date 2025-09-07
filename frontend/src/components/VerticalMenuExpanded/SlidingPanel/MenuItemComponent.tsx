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
  const isGroupActive =
    item.type === MENU.TYPE.GROUP && state.activePath.length === 0;

  return (
    <>
      <div
        className={`flex flex-row items-center cursor-pointer transition group`}
      >
        <div
          key={i}
          className={`group text-[var(--vertical-secondary-text)] flex flex-1 items-center ${
            !isGroupActive
              ? " hover:text-[var(--vertical-secondary-text-hover)] hover:bg-[var(--accent-primary)] p-2"
              : "text-[var(--vertical-secondary-text-muted)]"
          }  rounded-md`}
          onClick={() => {
            if (
              item.type === MENU.TYPE.GROUP &&
              state.activePath.length !== 0
            ) {
              SlidingPanelController.setActivePath([...state.activePath, i]);
            }

            if (item.type === MENU.TYPE.ROUTE) {
              SlidingPanelController.close();
            }

            onItemClick(item);
          }}
        >
          <span
            className={` ${
              item.items?.length && isGroupActive ? " hidden" : " "
            }  mr-3`}
          >
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

          <span
            className={` font-semibold text-sm ${
              item.items?.length && isGroupActive
                ? " w-full uppercase text-xs text-[var(--vertical-secondary-text-muted)]"
                : ""
            }   truncate`}
          >
            {item.label}
          </span>

          {item.type === "group" && state.activePath.length !== 0 && (
            <span className="ml-auto pr-1 text-[var(--vertical-secondary-text)]">
              ⮯
            </span>
          )}
        </div>
        {/* RIGHT: Pin Button */}
        {item.type !== "group" && onPinClick && (
          <button
            type="button"
            title={item.isPinned ? "Unpin menu" : "Pin menu"}
            className="text-[var(--vertical-secondary-text)] hover:bg-[var(--accent-primary)] hover:text-[var(--vertical-secondary-text-hover)] p-2 rounded cursor-pointer"
            onClick={() => onPinClick(item)}
          >
            {iconRenderer?.({
              name: item.isPinned ? "RiPushpin2Fill" : "RiPushpin2Line",
              size: 15,
            })}
          </button>
        )}
      </div>
      {/* RENDER CHILDREN HANYA JIKA GROUP SEDANG AKTIF */}
      {isGroupActive &&
        item.items?.map((child: any, idx: number) => (
          <MenuItemComponent
            key={idx}
            state={{ ...state, activePath: [...state.activePath, i] }}
            item={child}
            i={idx}
            onItemClick={onItemClick}
            iconRenderer={iconRenderer}
            defaultIcon={defaultIcon}
            onPinClick={onPinClick}
          />
        ))}
    </>
  );
}
