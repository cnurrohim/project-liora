import { useEffect, useState } from "react";
import { MenuProviderController } from "@/controller/menuProviderController";
import { flattenMenu, type FlatMenuItem } from "./flattenMenu"; // tempatkan fungsi flattenMenu di file terpisah jika mau
import { TabController } from "@/components/Tab/controller";
import { handleMenuClick } from "@/utils/handleMenuClick";
import { IconRenderer } from "@/components/IconRenderer";
import { PinnedMenuController } from "@/controller/PinnedMenuController";

export default function ListLauncher() {
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
      <div className="p-4 space-y-4">
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

        <div>
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
            <div key={parent} className="mb-4">
              <div className="text-(--accent-primary) font-semibold">
                {parent}
              </div>
              <div className="pl-2 mt-1 space-y-1">
                {items.map((item, i) => (
                  <div key={i} className="flex flex-row">
                    <button
                      type="button"
                      title={item.isPinned ? "Unpin menu" : "Pin menu"}
                      className="text-(--content-text) hover:text-(--accent-hover) cursor-pointer hover:bg-(--content-surface-hover) p-2"
                      onClick={() => {
                        handlePinClick(item);
                      }}
                    >
                      <IconRenderer
                        name={
                          item.isPinned ? "RiPushpin2Fill" : "RiPushpin2Line"
                        }
                        size={15}
                      />
                    </button>

                    <div
                      key={i}
                      onClick={() => handleClick(item)}
                      className="w-full flex items-center gap-2 text-sm text-(--content-text) cursor-pointer hover:bg-(--content-surface-hover) px-2 py-1 rounded group"
                    >
                      <span className="group-hover:text-(--accent-hover) text-(--accent-primary)">
                        {typeof item.icon === "string" && item.icon ? (
                          <IconRenderer
                            name={item.icon}
                            size={15}
                            color={item.icon_color}
                          />
                        ) : (
                          <IconRenderer
                            name="RiApps2Line"
                            size={15}
                            color={item.icon_color}
                          />
                        )}
                      </span>
                      <span>{item.label}</span>
                      <span className="ml-auto text-(--content-text) text-xs">
                        {item.route || item.command}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* <UserProfileWidget /> */}
    </>
  );
}
