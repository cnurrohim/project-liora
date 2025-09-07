import { IconRenderer } from "@/components/IconRenderer";
import { AppInfoController } from "@/components/VerticalMenu/appInfoController";
import { UserProfileController } from "@/components/VerticalMenu/userProfileController";
import { useEffect, useState } from "react";
import { switchRoleAPI } from "../LoginPage/login.api";
import { reinitializeApp } from "@/hooks/useInitApp";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { openTabSmart } from "@/utils/handleMenuClick/openTabSmart";
import { runCommand } from "@/utils/handleMenuClick";
import { API_URL } from "@/constants/common";

export default function UserProfileWidget() {
  const [appInfo, setAppInfo] = useState(() => AppInfoController.getState());
  const [userProfile, setUserProfile] = useState(() =>
    UserProfileController.getState()
  );

  const [showRoles, setShowRoles] = useState(false);

  useEffect(() => {
    const updateAppInfo = () => setAppInfo(AppInfoController.getState());
    const updateUserProfile = () =>
      setUserProfile(UserProfileController.getState());

    const unsubAppInfo = AppInfoController.subscribe(updateAppInfo);
    const unsubUserProfile = UserProfileController.subscribe(updateUserProfile);

    return () => {
      unsubAppInfo;
      unsubUserProfile;
    };
  }, []);

  function onLogout() {
    runCommand({
      id: "logout",
      label: "logout",
      type: "command",
      command: "logout",
    });
  }

  function onViewProfileClick() {
    openTabSmart(
      {
        id: `user-profile`,
        route: `/profile`,
        label: `User Profile`,
        type: "route",
        icon: "RiPencilFill",
      },
      { replace: true }
    );
  }

  async function handleSwitchRole(roleId: string) {
    try {
      const { token, user } = await switchRoleAPI(roleId);

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      await reinitializeApp();

      showSuccessToast(`Role switched to ${user.defaultRole.name}`);
    } catch (err) {
      showErrorToast(`Switch role failed: ${err}`);
    }
  }

  return (
    <div className="bg-[var(--foreground)] mt-4 p-10 relative">
      {/* Fixed footer */}
      {userProfile.user && (
        <div className=" py-4 transition-all duration-300 px-3 ">
          {/* Foto profil + data */}
          <div className="flex gap-10 ">
            <img
              src={
                userProfile.user?.profile_photo
                  ? `${API_URL}${userProfile.user?.profile_photo}`
                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      userProfile.user?.name || ""
                    )}&background=0D8ABC&color=fff`
              }
              alt={userProfile.user?.name || "User profile photo"}
              className="w-[82px] h-[82px] rounded-full object-cover border border-gray-600"
            />
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-[var(--content-text)] text-base ">
                {userProfile.user?.name}
              </span>
              <span className="text-sm text-[var(--content-text)] ">
                @{userProfile.user?.username}
              </span>
              <span className="text-sm text-[var(--content-text)] ">
                {userProfile.user?.defaultRole?.name}
              </span>
              <span className="text-sm text-[var(--content-text)] ">
                {/* Actions */}
                {onViewProfileClick && (
                  <button
                    onClick={onViewProfileClick}
                    className="cursor-pointer w-full text-left text-blue-400 hover:text-blue-300 text-sm"
                  >
                    Manage Profile
                  </button>
                )}
              </span>
              <span className="text-sm text-[var(--content-text)] ">
                {/* Actions */}
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="cursor-pointer w-full text-left hover:text-[var(--content-text)] text-sm"
                  >
                    Logout
                  </button>
                )}
              </span>
            </div>

            <div className="flex flex-col w-58">
              {/* Switch Role */}
              {(userProfile.user?.roles?.length ?? 0) > 1 && (
                <div className="relative ">
                  <button
                    onClick={() => setShowRoles((prev) => !prev)}
                    className={`cursor-pointer relative w-full hover:bg-gray-700 ${
                      showRoles ? "text-gray-500" : "text-[var(--content-text)]"
                    } text-sm py-1 rounded flex justify-between items-center px-3 `}
                  >
                    Switch Role
                    <IconRenderer
                      name={showRoles ? "RiArrowUpSLine" : "RiArrowDownSLine"}
                      size={18}
                      color={"#9c9c9c"}
                    />
                  </button>
                  <div
                    className="overflow-hidden transition-all duration-300 "
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
                    {handleSwitchRole && (
                      <div className="flex flex-col gap-1 ">
                        {userProfile.user?.roles
                          ?.filter(
                            (role) =>
                              role.id !== userProfile.user?.defaultRole?.id
                          )
                          .map((role) => (
                            <button
                              key={role.id}
                              onClick={() => handleSwitchRole(role.id)}
                              className="cursor-pointer bg-[var(--content-surface)] block w-full text-left px-3 py-2 text-sm text-[var(--content-text)] hover:bg-gray-700 rounded"
                            >
                              {role.name}
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
