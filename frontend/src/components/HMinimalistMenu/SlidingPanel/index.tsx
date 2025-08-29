import { useEffect, useState, type ReactNode } from "react";
import { resolveItems, SlidingPanelController } from "./controller";
import { useController } from "../../../hooks/useController";
import type { MenuItem } from "../../../types/menu";
import MenuItemComponent from "./MenuItemComponent";
import { UserProfileController } from "../userProfileController";
import { API_URL } from "../constant";

export default function SlidingPanel({
  onItemClick,
  onViewProfileClick,
  iconRenderer,
  defaultIcon,
  onPinClick,
  onLogout,
  onSwitchRole,
}: {
  onItemClick: (item: MenuItem) => void;
  onViewProfileClick?: () => void;
  iconRenderer?: (props: {
    name: ReactNode | string | undefined;
    size?: number;
    color?: string;
  }) => ReactNode;
  defaultIcon?: (props: { size?: number; color?: string }) => ReactNode;
  onPinClick?: (item: MenuItem) => void;
  onLogout?: () => void;
  onSwitchRole?: (userId: string) => void;
}) {
  const [state, setState] = useState(SlidingPanelController.getState());

  const [userProfile, setUserProfile] = useState(() =>
    UserProfileController.getState()
  );

  const [showRoles, setShowRoles] = useState(false);
  const visible = useController(SlidingPanelController, (s) => s.visible);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const update = () => setState(SlidingPanelController.getState());
    const updateUserProfile = () =>
      setUserProfile(UserProfileController.getState());

    const unsubUpdate = SlidingPanelController.subscribe(update);
    const unsubUserProfile = UserProfileController.subscribe(updateUserProfile);

    return () => {
      unsubUpdate;
      unsubUserProfile;
    };
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
    max-h-full  max-w-full bg-gray-900 text-white shadow-lg
    transform transition-transform duration-300 z-40 flex flex-row p-4 gap-3 
    ${
      visible
        ? state.position === "top"
          ? "translate-y-0 mt-15"
          : "translate-y-0 mb-15"
        : state.position === "top"
        ? "-translate-y-full"
        : "translate-y-full"
    }
    ${!visible ? "pointer-events-none" : ""}
  `}
    >
      <div className="flex flex-col w-full">
        <div className="relative  mb-2">
          <span className="absolute left-3 top-1/4 text-gray-400">
            {iconRenderer?.({
              name: "RiSearchLine",
              size: 18,
              color: "#9c9c9c",
            })}
          </span>

          {/* Search Input */}
          <input
            type="text"
            placeholder="Search menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-3 p-2 pl-10 rounded bg-gray-800 text-white focus:outline-none"
          />
        </div>

        {state.start?.label && (
          <div className="text-sm uppercase text-gray-400 mb-2 px-1">
            {state.start.label}
          </div>
        )}
        <nav className="flex flex-col flex-wrap gap-x-2 overflow-auto px-1">
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
          <div className="mt-4  pt-2 pl-4">
            <div
              onClick={() => SlidingPanelController.goBack()}
              className="text-gray-400 group hover:text-white cursor-pointer flex flex-row items-center"
            >
              <span className=" group-hover:text-gray-300 text-gray-400 pr-2">
                {iconRenderer?.({
                  name: "RiArrowLeftUpBoxFill",
                  size: 18,
                  color: "#9c9c9c",
                })}
              </span>
              <span className="text-gray-400 group-hover:text-gray-300">
                Back
              </span>
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
