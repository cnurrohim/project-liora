import { useEffect, useState } from "react";
import { MenuBarController } from "./controller";
import type { MenuBarEntry } from "../types";
import { handleClick } from "./action";

export default function MenuBar() {
  const [entries, setEntries] = useState(() => MenuBarController.getState());

  useEffect(() => {
    const update = () => setEntries(MenuBarController.getState());
    MenuBarController.subscribe(update);
    return () => MenuBarController.unsubscribe(update);
  }, []);

  const renderButton = (entry: MenuBarEntry) => (
    <button
      key={entry.key}
      title={entry.label}
      className={`text-2xl w-8 h-8 rounded flex items-center justify-center hover:text-lime-400 text-rose-300 cursor-pointer ${
        entry.key === MenuBarController.getActive() ? "" : ""
      }`}
      onClick={() => handleClick(entry)}
    >
      {entry.icon}
    </button>
  );

  return (
    <div className="relative w-screen z-80">
      <aside
        className={`${
          entries.position === "top" ? "border-t-4" : "border-b-4"
        } relative border-rose-500 w-full h-10 px-4 bg-gray-900 text-white flex flex-row justify-between py-1 z-100 shadow-md`}
      >
        <div className="flex flex-row items-center">
          <div className="text-2xl font-bold text-rose-500 mr-5">
            {entries.logo} {entries.name}
          </div>
          {entries.start.map(renderButton)}
        </div>
        <div className="flex flex-row items-center">
          {entries.end.map(renderButton)}
        </div>
      </aside>
    </div>
  );
}
