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
      className={`text-2xl w-8 h-8 rounded flex items-center justify-center 
        hover:bg-(--accent-primary) 
        hover:text-(--horizontal-text-hover) 
        cursor-pointer ${
          entry.key === MenuBarController.getActive()
            ? "text-(--horizontal-text-hover) bg-(--accent-primary)"
            : "text-(--horizontal-text)"
        }`}
      onClick={() => handleClick(entry)}
    >
      {entry.icon}
    </button>
  );

  function Logo({ src, alt }: { src: string; alt: string }) {
    const [error, setError] = useState(false);

    if (error || !src) {
      return (
        <span className="h-8 w-8 rounded-full my-3 flex items-center justify-center bg-gray-300 text-sm">
          📦
        </span>
      );
    }

    return (
      <img
        src={src || undefined}
        alt={alt}
        className="h-8 w-8 rounded-full my-3"
        onError={() => setError(true)}
      />
    );
  }

  return (
    <div className="relative w-screen z-80">
      <aside
        className={`relative w-full h-12 px-4 bg-(--horizontal-surface) text-(--horizontal-text) flex flex-row justify-between py-1 z-100 shadow-md`}
      >
        <div className="flex flex-row items-center gap-1">
          <div className="text-2xl font-bold text-(--accent-primary)  mr-5 flex flex-row items-center gap-2">
            <Logo
              src={appInfo.logo ? `${API_URL}/uploads/app/${appInfo.logo}` : ""}
              alt={`${appInfo.name} logo`}
            />

            <span
              className="text-(--accent-primary) break-words"
              style={{
                fontSize: "clamp(1rem, 2vw, 1rem)",
                maxWidth: "80%",
                wordBreak: "break-word",
              }}
            >
              {appInfo.name}
            </span>
          </div>
          {entries.start.map(renderButton)}
        </div>
        <div className="flex flex-row items-center gap-1">
          {entries.end.map(renderButton)}
        </div>
      </aside>
    </div>
  );
}
