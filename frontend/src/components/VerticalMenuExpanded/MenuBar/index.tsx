import { useEffect, useState } from "react";
import { MenuBarController } from "./controller";
import type { MenuBarEntry } from "../types";
import { handleClick } from "./action";
import { AppInfoController } from "../appInfoController";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function MenuBar() {
  const [entries, setEntries] = useState(() => MenuBarController.getState());
  const [appInfo, setAppInfo] = useState(() => AppInfoController.getState());

  useEffect(() => {
    const update = () => setEntries(MenuBarController.getState());
    MenuBarController.subscribe(update);

    const updateAppInfo = () => setAppInfo(AppInfoController.getState());
    AppInfoController.subscribe(updateAppInfo);

    return () => {
      MenuBarController.unsubscribe(update);
      AppInfoController.unsubscribe(updateAppInfo);
    };
  }, []);

  const renderButton = (entry: MenuBarEntry) => (
    <button
      key={entry.key}
      title={entry.label}
      className={`p-2 rounded-md hover:bg-[var(--panel-hover)]  hover:text-[var(--panel-text-hover)] transition cursor-pointer ${
        entry.key === MenuBarController.getActive()
          ? "text-[var(--panel-background)] bg-[var(--accent-primary)]"
          : "text-[var(--panel-text-primary)]"
      }`}
      onClick={() => handleClick(entry)}
    >
      {entry.icon}
    </button>
  );

  return (
    <aside
      className={`relative  h-full w-14 bg-[var(--background)] text-[var(--panel-text-primary)] flex flex-col justify-between z-40`}
    >
      <div className="flex flex-col items-center ">
        <img
          src={`${API_URL}/uploads/${appInfo.logo}`}
          alt={`${appInfo.name} logo`}
          className="h-8 w-8 rounded-full my-3"
        />
      </div>
      <div className="flex flex-col items-center justify-between h-full space-y-4 mt-3">
        <div className="flex flex-col gap-3">
          {entries.start.map(renderButton)}
        </div>

        <div className="flex flex-col gap-3 mb-5">
          {entries.end.map(renderButton)}
        </div>
      </div>
    </aside>
  );
}
