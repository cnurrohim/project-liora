// src/components/Sidebar/MenuBar/index.tsx
import { useEffect, useState } from "react";
import { MenuBarController } from "./controller";
import type { MenuBarEntry } from "../types";
import { handleClick } from "./action";

const API_URL = import.meta.env.VITE_API_BASE_URL;

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
    <div className="relative h-screen z-40">
      <aside
        className={`${
          entries.position === "left" ? "border-l-4" : "border-r-4"
        } relative border-rose-500 h-full w-14 bg-gray-900 text-white flex flex-col justify-between py-1 z-100 shadow-md`}
      >
        <div className="mt-2 flex flex-col items-center">
          <div className="text-2xl font-bold text-rose-500">
            <img
              src={`${API_URL}/uploads/${entries.logo}`}
              alt={`${entries.name} logo`}
              className="h-10 w-10"
            />
          </div>
          {entries.start.map(renderButton)}
        </div>
        <div className="flex flex-col items-center mb-2">
          {entries.end.map(renderButton)}
        </div>
      </aside>
    </div>
  );
}
