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
      className={`p-2 rounded-md hover:bg-gray-800 text-gray-400 hover:text-white transition cursor-pointer ${
        entry.key === MenuBarController.getActive()
          ? "text-rose-400 bg-gray-800"
          : ""
      }`}
      onClick={() => handleClick(entry)}
    >
      {entry.icon}
    </button>
  );

  return (
    <aside
      className={`${
        entries.position === "left" ? "border-l-4" : "border-r-4"
      } relative border-rose-500 h-full w-14 bg-gray-900 text-white flex flex-col justify-between py-2 shadow-md z-40`}
    >
      <div className="flex flex-col items-center space-y-4 mt-3">
        <img
          src={`${API_URL}/uploads/${entries.logo}`}
          alt={`${entries.name} logo`}
          className="h-10 w-10 rounded-full border border-rose-400 shadow"
        />
        <div className="flex flex-col gap-3">
          {entries.start.map(renderButton)}
        </div>
      </div>

      <div className="flex flex-col items-center space-y-3 mb-3">
        {entries.end.map(renderButton)}
      </div>
    </aside>
  );
}
