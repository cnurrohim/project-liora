import { useEffect, useState } from "react";
import { MenuProviderController } from "@/controller/menuProviderController";
import { flattenMenu, type FlatMenuItem } from "./flattenMenu"; // tempatkan fungsi flattenMenu di file terpisah jika mau
import { TabController } from "@/components/Tab/controller";
import { handleMenuClick } from "@/utils/handleMenuClick";
import { IconRenderer } from "@/components/IconRenderer";
import { PinnedMenuController } from "@/controller/PinnedMenuController";

export default function AppLauncher() {
  const [search, setSearch] = useState("");
  const [menu, setMenu] = useState<FlatMenuItem[]>([]);

  useEffect(() => {
    const updateMenu = () => {
      const data = MenuProviderController.getState().sections;
      const flat = flattenMenu(data);
      setMenu(flat);
    };

    // initial load
    updateMenu();

    // subscribe to updates
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
    const menuItem = flatItem.original; // langsung pakai MenuItem asli
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
    <div className="p-4 space-y-4">
      <input
        type="text"
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-3 py-2 bg-gray-800 text-white border-none outline-none"
      />

      <div>
        {filtered.length === 0 && (
          <div className="text-gray-400">No results.</div>
        )}
        {Object.entries(
          filtered.reduce<Record<string, FlatMenuItem[]>>((acc, item) => {
            acc[item.parent] ??= [];
            acc[item.parent].push(item);
            return acc;
          }, {})
        ).map(([parent, items]) => (
          <div key={parent} className="mb-4">
            <div className="text-rose-400 font-semibold">{parent}</div>
            <div className="pl-2 mt-1 space-y-1">
              {items.map((item, i) => (
                <div key={i} className="flex flex-row">
                  <button
                    type="button"
                    title={item.isPinned ? "Unpin menu" : "Pin menu"}
                    className="text-rose-400 cursor-pointer hover:bg-gray-700 p-2"
                    onClick={() => {
                      handlePinClick(item);
                    }}
                  >
                    <IconRenderer
                      name={item.isPinned ? "RiPushpin2Fill" : "RiPushpin2Line"}
                      size={15}
                      color="#9c9c9c"
                    />
                  </button>

                  <div
                    key={i}
                    onClick={() => handleClick(item)}
                    className="w-full flex items-center gap-2 text-sm text-gray-200 cursor-pointer hover:bg-gray-800 px-2 py-1 rounded"
                  >
                    <span className="text-rose-300">
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
                    <span className="ml-auto text-gray-400 text-xs">
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
  );
}
