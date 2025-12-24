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
    h-64 w-full bg-(--horizontal-secondary-surface) text-(--horizontal-secondary-text) shadow-lg
    transform transition-transform duration-300 z-40 flex flex-row  py-4 gap-3 
    ${
      visible
        ? state.position === "top"
          ? "translate-y-0 mt-10"
          : "translate-y-0 mb-10"
        : state.position === "top"
        ? "-translate-y-full"
        : "translate-y-full"
    }
    ${!visible ? "pointer-events-none" : ""}
  `}
    >
      <div className="flex flex-col w-full mt-2 pl-3">
        <div className="relative w-full mb-2">
          <span className="absolute left-3 top-1/4 text-(--horizontal-secondary-text)">
            {iconRenderer?.({
              name: "RiSearchLine",
              size: 18,
            })}
          </span>

          {/* Search Input */}
          <input
            type="text"
            placeholder="Search menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full mb-3 p-2 pl-10 rounded text-(--horizontal-secondary-tex) bg-(--horizontal-secondary-surface-hover) focus:outline-none"
          />
        </div>

        {state.start?.label && (
          <div className="text-sm uppercase text-(--horizontal-secondary-text) mb-2 px-1">
            {state.start.label}
          </div>
        )}
        <nav className="flex flex-row flex-wrap gap-x-2 overflow-auto px-1">
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
          <div
            onClick={() => SlidingPanelController.goBack()}
            className="text-(--horizontal-secondary-text) group hover:text-(--horizontal-secondary-text-hover) hover:bg-(--accent-primary) cursor-pointer flex flex-row items-center w-50 px-3 py-2 mt-2"
          >
            <span className=" group-hover:text-(--horizontal-secondary-text-hover) text-(--horizontal-secondary-text) pr-2">
              {iconRenderer?.({
                name: "RiArrowLeftUpBoxFill",
                size: 18,
              })}
            </span>
            <span className="text-(--horizontal-secondary-text) group-hover:text-(--horizontal-secondary-text-hover)">
              Back
            </span>
          </div>
        )}
      </div>

      {/* Header */}
      <div className="w-1/3 px-4 relative">
        <button
          className="cursor-pointer bg-(--accent-primary) hover:bg-(--accent-hover) rounded-full absolute right-5 top-2"
          title="Collapse menu"
          onClick={() => SlidingPanelController.close()}
        >
          {iconRenderer?.({
            name:
              state.position === "top" ? "RiArrowUpSLine" : "RiArrowDownSLine",
            size: 20,
            color: "#eee",
          })}
        </button>

        {/* Fixed footer */}
        {userProfile.user && (
          <div className="  transition-all duration-300 py-3 w-full">
            {/* Foto profil + data */}
            <div className="flex items-center gap-3">
              <img
                src={
                  userProfile.user?.profile_photo
                    ? `${API_URL}${userProfile.user?.profile_photo}`
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        userProfile.user?.name || ""
                      )}&background=0D8ABC&color=fff`
                }
                alt={userProfile.user?.name || "User profile photo"}
                className="w-[52px] h-[52px] rounded-full object-cover border border-gray-600"
              />
              <div className="flex flex-col">
                <span className="font-semibold text-[var(bg-(--accent-primary) hover:bg-(--accent-hover))] text-sm">
                  {userProfile.user?.name}
                </span>
                <span className="text-xs text-(--horizontal-secondary-text-muted)">
                  @{userProfile.user?.username}
                </span>
                <span className="text-xs text-(--horizontal-secondary-text-muted)">
                  {userProfile.user?.defaultRole?.name}
                </span>
              </div>
            </div>

            {/* Switch Role */}
            {(userProfile.user?.roles?.length ?? 0) > 1 && (
              <div className="relative mt-3 overflow-auto max-h-26">
                <button
                  onClick={() => setShowRoles((prev) => !prev)}
                  className={`cursor-pointer relative w-full text-(--horizontal-secondary-text) 
                  hover:text-(--horizontal-secondary-text-hover) hover:bg-(--accent-primary) ${
                    showRoles
                      ? "text-(--horizontal-secondary-text-muted)"
                      : "text-(--horizontal-secondary-text)"
                  } text-sm py-1 rounded flex justify-between items-center px-3`}
                >
                  Switch Role
                  {iconRenderer?.({
                    name: showRoles ? "RiArrowUpSLine" : "RiArrowDownSLine",
                    size: 18,
                  })}
                </button>
                <div
                  className="overflow-hidden transition-all duration-300"
                  style={{
                    maxHeight: showRoles
                      ? `${
                          userProfile.user?.roles.filter(
                            (role) =>
                              role.id !== userProfile.user?.defaultRole?.id
                          ).length * 40
                        }px`
                      : "0px",
                  }}
                >
                  {onSwitchRole && (
                    <div className="flex flex-col gap-1">
                      {userProfile.user?.roles
                        ?.filter(
                          (role) =>
                            role.id !== userProfile.user?.defaultRole?.id
                        )
                        .map((role) => (
                          <button
                            key={role.id}
                            onClick={() => onSwitchRole(role.id)}
                            className="cursor-pointer 
                          bg-(--horizontal-secondary-surface-hover) 
                          text-(--horizontal-secondary-text) 
                          
                          block w-full 
                          text-left 
                          px-3 py-2 text-sm 
                          hover:text-(--horizontal-secondary-text-hover) 
                          hover:bg-(--accent-primary) rounded"
                          >
                            {role.name}
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-row gap-2">
              {onViewProfileClick && (
                <button
                  onClick={onViewProfileClick}
                  className="cursor-pointer mt-3 w-full 
                bg-(--horizontal-secondary-surface-hover) 
                text-(--horizontal-secondary-text) 
                
                          hover:text-(--horizontal-secondary-text-hover) 
                          hover:bg-(--accent-primary) text-sm py-1 rounded"
                >
                  View Profile
                </button>
              )}
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="cursor-pointer mt-3 px-2 w-fit 
                border-(--horizontal-secondary-border) border 
                text-(--horizontal-secondary-text) 
                
                          hover:text-(--horizontal-secondary-text-hover) 
                          hover:bg-(--accent-primary) text-sm py-1 rounded"
                >
                  {iconRenderer?.({
                    name: "RiShutDownLine",
                    size: 18,
                  })}
                </button>
              )}
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
