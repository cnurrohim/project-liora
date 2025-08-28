import { useEffect, useState, type ReactNode } from "react";
import { resolveItems, SlidingPanelController } from "./controller";
import { useController } from "../../../hooks/useController";
import type { MenuGroup, MenuItem } from "../../../types/menu";
import MenuItemComponent from "./MenuItemComponent";
import { AppInfoController } from "../appInfoController";
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
  const [appInfo, setAppInfo] = useState(() => AppInfoController.getState());
  const [userProfile, setUserProfile] = useState(() =>
    UserProfileController.getState()
  );

  const [showRoles, setShowRoles] = useState(false);
  const visible = useController(SlidingPanelController, (s) => s.visible);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const update = () => setState(SlidingPanelController.getState());
    const updateAppInfo = () => setAppInfo(AppInfoController.getState());
    const updateUserProfile = () =>
      setUserProfile(UserProfileController.getState());

    const unsubUpdate = SlidingPanelController.subscribe(update);
    const unsubAppInfo = AppInfoController.subscribe(updateAppInfo);
    const unsubUserProfile = UserProfileController.subscribe(updateUserProfile);

    return () => {
      unsubUpdate;
      unsubAppInfo;
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
    fixed top-0 ${state.position === "left" ? "left-14" : "right-14"}
    h-full w-80 bg-gray-900 text-white shadow-xl
    transform transition-transform duration-300 z-30 flex flex-col 
    ${
      visible
        ? "translate-x-0"
        : state.position === "left"
        ? "-translate-x-full"
        : "translate-x-full"
    }
    ${!visible ? "pointer-events-none" : ""}
  `}
    >
      {/* Header */}
      <div className="relative flex flex-row items-start py-4 px-3 justify-between text-2xl font-bold text-blue-500 font-logo">
        <span
          className="text-gray-200 break-words"
          style={{
            fontSize: "clamp(1rem, 2vw, 1.5rem)",
            maxWidth: "80%",
            wordBreak: "break-word",
          }}
        >
          {appInfo.name}
        </span>
        <button
          className="cursor-pointer mt-1 bg-gray-700 rounded-full"
          title="Collapse menu"
          onClick={() => SlidingPanelController.close()}
        >
          {iconRenderer?.({
            name:
              state.position === "left"
                ? "RiArrowLeftSLine"
                : "RiArrowRightSLine",
            size: 20,
            color: "#eee",
          })}
        </button>
      </div>

      {/* Search Input */}

      <div className="relative mb-6 px-3">
        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400">
          {iconRenderer?.({
            name: "RiSearchLine",
            size: 18,
            color: "#9c9c9c",
          })}
        </span>
        <input
          type="text"
          placeholder="Search menu..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="p-2 pl-10 w-full rounded bg-gray-800 text-white focus:outline-none"
        />
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-auto mt-2 px-3">
        {/* Menu List */}
        {state.start?.label && (
          <>
            <div className="font-primary text-sm uppercase text-gray-500 font-bold mb-4">
              {state.start.label}
            </div>
          </>
        )}
        <nav>
          {items.map((item, i) => (
            <div
              key={i}
              className={`${(item as MenuGroup).items?.length ? "mb-5" : ""}`}
            >
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
            </div>
          ))}

          {state.activePath.length > 0 && (
            <div className="mt-4 border-t border-gray-700 p-2 hover:bg-gray-800 group">
              <div
                onClick={() => {
                  if (state.activePath.length == 2)
                    SlidingPanelController.unsetActivePath();

                  SlidingPanelController.goBack();
                }}
                className="cursor-pointer "
              >
                <span className="ml-auto text-gray-100 pr-2">⮬</span>
                <span className="font-medium text-gray-400 group-hover:text-gray-100">
                  Back
                </span>
              </div>
            </div>
          )}
        </nav>
      </div>

      {/* Fixed footer */}
      {userProfile.user && (
        <div className="border-t border-gray-700 py-4 transition-all duration-300 px-3">
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
              <span className="font-semibold text-white text-sm">
                {userProfile.user?.name}
              </span>
              <span className="text-xs text-gray-400">
                @{userProfile.user?.username}
              </span>
              <span className="text-xs text-gray-500">
                {userProfile.user?.defaultRole?.name}
              </span>
            </div>
          </div>

          {/* Switch Role */}
          {(userProfile.user?.roles?.length ?? 0) > 1 && (
            <div className="relative mt-3">
              <button
                onClick={() => setShowRoles((prev) => !prev)}
                className={`cursor-pointer relative w-full hover:bg-gray-700 ${
                  showRoles ? "text-gray-500" : "text-gray-300"
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
                        (role) => role.id !== userProfile.user?.defaultRole?.id
                      )
                      .map((role) => (
                        <button
                          key={role.id}
                          onClick={() => onSwitchRole(role.id)}
                          className="cursor-pointer bg-gray-800 block w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded"
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
                className="cursor-pointer mt-3 w-full bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm py-1 rounded"
              >
                View Profile
              </button>
            )}
            {onLogout && (
              <button
                onClick={onLogout}
                className="cursor-pointer mt-3 px-2 w-fit border-gray-800 border-2 hover:bg-gray-700 text-white text-sm py-1 rounded"
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
