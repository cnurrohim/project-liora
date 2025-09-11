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
      className={`p-2 rounded-md 
        hover:bg-[var(--accent-primary)] 
        hover:text-[var(--vertical-text-hover)] 
        transition cursor-pointer ${
          entry.key === MenuBarController.getActive()
            ? "text-[var(--vertical-text-hover)] bg-[var(--accent-primary)]"
            : "text-[var(--vertical-text)]"
        }`}
      onClick={() => handleClick(entry)}
    >
      {entry.icon}
    </button>
  );

  function Logo({ src, alt }: { src: string; alt: string }) {
    const [error, setError] = useState(false);

    if (error) {
      return (
        <span className="h-8 w-8 rounded-full my-3 flex items-center justify-center bg-gray-300 text-sm">
          📦
        </span>
      );
    }

    return (
      <img
        src={src}
        alt={alt}
        className="h-8 w-8 rounded-full my-3"
        onError={() => setError(true)}
      />
    );
  }
  return (
    <aside
      className={` relative  h-full w-14  bg-[var(--vertical-surface)] text-[var(--vertical-text)] flex flex-col justify-between z-40`}
    >
      <div className="flex flex-col items-center ">
        <Logo
          src={`${API_URL}/uploads/app/${appInfo.logo}`}
          alt={`${appInfo.name} logo`}
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
