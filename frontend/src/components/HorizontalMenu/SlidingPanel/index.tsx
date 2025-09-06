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
    h-64 w-full bg-[var(--foreground)] text-[var(--text-primary)] shadow-lg
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
          <span className="absolute left-3 top-1/4 text-[var(--panel-text-primary)]">
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
            className="w-full mb-3 p-2 pl-10 rounded bg-[var(--background)] text-[var(--text-primary)] focus:outline-none"
          />
        </div>

        {state.start?.label && (
          <div className="text-sm uppercase text-[var(--panel-text-primary)] mb-2 px-1">
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
          <div className="mt-4  pt-2 pl-4">
            <div
              onClick={() => SlidingPanelController.goBack()}
              className="text-[var(--panel-text-primary)] group hover:text-[var(--text-primary)] cursor-pointer flex flex-row items-center"
            >
              <span className=" group-hover:text-[var(--text-primary)] text-[var(--panel-text-primary)] pr-2">
                {iconRenderer?.({
                  name: "RiArrowLeftUpBoxFill",
                  size: 18,
                  color: "#9c9c9c",
                })}
              </span>
              <span className="text-[var(--panel-text-primary)] group-hover:text-[var(--text-primary)]">
                Back
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Header */}
      <div className="w-1/3 border-l border-[var(--border)] px-4 relative">
        <button
          className="cursor-pointer hover:bg-gray-700 bg-[var(--background)] rounded-full absolute right-5 top-2"
          title="Collapse menu"
          onClick={() => SlidingPanelController.close()}
        >
          {iconRenderer?.({
            name:
              state.position === "top" ? "RiArrowUpSLine" : "RiArrowDownSLine",
            size: 20,
            color: "",
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
                <span className="font-semibold text-[var(--text-primary)] text-sm">
                  {userProfile.user?.name}
                </span>
                <span className="text-xs text-[var(--panel-text-primary)]">
                  @{userProfile.user?.username}
                </span>
                <span className="text-xs text-gray-500">
                  {userProfile.user?.defaultRole?.name}
                </span>
              </div>
            </div>

            {/* Switch Role */}
            {(userProfile.user?.roles?.length ?? 0) > 1 && (
              <div className="relative mt-3 overflow-auto max-h-26">
                <button
                  onClick={() => setShowRoles((prev) => !prev)}
                  className={`cursor-pointer relative w-full hover:bg-gray-700 ${
                    showRoles ? "text-gray-500" : "text-[var(--text-primary)]"
                  } text-sm py-1 rounded flex justify-between items-center px-3`}
                >
                  Switch Role
                  {iconRenderer?.({
                    name: showRoles ? "RiArrowUpSLine" : "RiArrowDownSLine",
                    size: 18,
                    color: "#9c9c9c",
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
                            className="cursor-pointer bg-[var(--background)] block w-full text-left px-3 py-2 text-sm text-[var(--text-primary)] hover:bg-gray-700 rounded"
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
                  className="cursor-pointer mt-3 w-full bg-[var(--background)] hover:bg-gray-700 text-[var(--text-primary)] text-sm py-1 rounded"
                >
                  View Profile
                </button>
              )}
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="cursor-pointer mt-3 px-2 w-fit border-gray-800 border-2 hover:bg-gray-700 text-[var(--text-primary)] text-sm py-1 rounded"
                >
                  {iconRenderer?.({
                    name: "RiShutDownLine",
                    size: 18,
                    color: "#c9c9c9",
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
