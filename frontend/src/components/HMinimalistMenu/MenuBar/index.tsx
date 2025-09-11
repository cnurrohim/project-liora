import { useEffect, useState } from "react";
import { MenuBarController } from "./controller";
import type { MenuBarEntry } from "../types";
import { handleClick } from "./action";

export default function MenuBar() {
  const [entries, setEntries] = useState(() => MenuBarController.getState());

  useEffect(() => {
    const update = () => setEntries(MenuBarController.getState());
    MenuBarController.subscribe(update);

    return () => {
      MenuBarController.unsubscribe(update);
    };
  }, []);

  const renderButton = (entry: MenuBarEntry) => (
    <button
      key={entry.key}
      title={entry.label}
      className={`text-2xl hover:bg-[var(--background)] w-8 h-8 rounded flex items-center justify-center hover:text-lime-400 text-[var(--text-primary)] cursor-pointer ${
        entry.key === MenuBarController.getActive() ? "" : ""
      }`}
      onClick={() => handleClick(entry)}
    >
      {entry.icon}
    </button>
  );

  return (
    <div className=" z-80 flex justify-center ">
      <aside
        className={`inline-flex max-w-full py-1  text-[var(--text-primary)] items-center justify-between gap-4 rounded shadow-md z-100`}
      >
        <div className="flex flex-row items-center gap-2">
          {entries.start.map(renderButton)}
        </div>
        <div className="h-full border-gray-600 border-r-1 border-dashed"></div>
        <div className="flex flex-row items-center gap-2">
          {entries.end.map(renderButton)}
        </div>
      </aside>
    </div>
  );
}
