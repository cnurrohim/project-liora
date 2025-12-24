import { useEffect, useState } from "react";
import { MenuProviderController } from "@/controller/menuProviderController";
import { flattenMenu, type FlatMenuItem } from "./flattenMenu"; // tempatkan fungsi flattenMenu di file terpisah jika mau
import { TabController } from "@/components/Tab/controller";
import { handleMenuClick } from "@/utils/handleMenuClick";
import { IconRenderer } from "@/components/IconRenderer";
import { PinnedMenuController } from "@/controller/PinnedMenuController";
//import UserProfileWidget from "./userProfile";

export default function BoxyLauncher() {
  const [search, setSearch] = useState("");
  const [menu, setMenu] = useState<FlatMenuItem[]>([]);

  useEffect(() => {
    const updateMenu = () => {
      const data = MenuProviderController.getState().sections;
      const flat = flattenMenu(data);
      setMenu(flat);
    };

    updateMenu();

    MenuProviderController.subscribe(updateMenu);

    return () => {
      MenuProviderController.unsubscribe(updateMenu);
    };
  }, []);

  const filtered = menu.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleClick = (item: FlatMenuItem) => {
    const currentTabKey = TabController.getActiveTabKey() ?? undefined;
    const menuItem = { ...item };

    if (item.type === "route") {
      handleMenuClick(
        {
          id: menuItem.id,
          type: "route",
          label: menuItem.label,
          route: menuItem.route!,
          icon: menuItem.icon,
          icon_color: menuItem.icon_color,
        },
        currentTabKey
      );
    }

    if (item.type === "command") {
      handleMenuClick(
        {
          id: item.id,
          type: "command",
          label: item.label,
          command: item.command!,
          icon: item.icon,
          icon_color: item.icon_color,
        },
        currentTabKey
      );
    }

    return;
  };

  const handlePinClick = async (flatItem: FlatMenuItem) => {
    const menuItem = flatItem.original;
    const isPinned = PinnedMenuController.getPinnedMenus().some(
      (m) => m.id === menuItem.id
    );

    try {
      if (isPinned) {
        await PinnedMenuController.removePinnedMenu(menuItem.id!);
      } else {
        await PinnedMenuController.addPinnedMenu(menuItem);
      }
      await MenuProviderController.load();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div className="px-10 space-y-4">
        <div className="flex justify-center w-full items-">
          <div className="relative my-6 w-2/3 ">
            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-(--content-text)">
              <IconRenderer name={"RiSearchLine"} size={18} />
            </span>
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-15 px-3 py-2 bg-(--content-surface-hover) text-(--content-text) rounded-lg border-none outline-none"
            />
          </div>
        </div>

        {filtered.length === 0 && (
          <div className="text-(--content-text)">No results.</div>
        )}
        {Object.entries(
          filtered.reduce<Record<string, FlatMenuItem[]>>((acc, item) => {
            acc[item.parent] ??= [];
            acc[item.parent].push(item);
            return acc;
          }, {})
        ).map(([parent, items]) => (
          <div key={parent} className="mb-6">
            <div className="text-(--accent-primary) font-semibold mb-2">
              {parent}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map((item, i) => (
                <div
                  key={i}
                  onClick={() => handleClick(item)}
                  className=" relative group gap-2 hover:bg-(--content-surface-hover) cursor-pointer p-4  flex flex-row shadow transition"
                >
                  {/* Pin button pojok kanan atas */}
                  <button
                    type="button"
                    title={item.isPinned ? "Unpin menu" : "Pin menu"}
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePinClick(item);
                    }}
                    className="cursor-pointer absolute top-2 right-2 text-(--content-text) hover:text-(--accent-primary)"
                  >
                    <IconRenderer
                      name={item.isPinned ? "RiPushpin2Fill" : "RiPushpin2Line"}
                      size={16}
                    />
                  </button>

                  {/* Icon */}
                  <div className=" text-(--content-text) w-10 flex items-center justify-center">
                    {typeof item.icon === "string" && item.icon ? (
                      <IconRenderer
                        name={item.icon}
                        size={38}
                        color={item.icon_color}
                      />
                    ) : (
                      <IconRenderer name="RiApps2Line" size={32} />
                    )}
                  </div>

                  <div className="flex flex-col">
                    {/* Label */}
                    <div className=" text-(--content-text) font-medium">
                      {item.label}
                    </div>

                    {/* Route / command kecil */}
                    <div className=" text-xs text-gray-500">
                      {item.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {/* <UserProfileWidget /> */}
    </>
  );
}
