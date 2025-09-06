import { useEffect, useState } from "react";
import { type ThemeId, themes } from "@/config/themes";
import { UserPreferencesController } from "@/controller/UserPreferencesController";

export function useUserPreferences() {
  const [prefs, setPrefs] = useState(UserPreferencesController.getState());

  useEffect(() => {
    const cb = () => setPrefs(UserPreferencesController.getState());
    UserPreferencesController.subscribe(cb);
    return () => UserPreferencesController.unsubscribe(cb);
  }, []);

  const setTheme = (theme: ThemeId) => {
    UserPreferencesController.set("theme", theme);
    UserPreferencesController.applyTheme(theme);
  };

  return {
    ...prefs,
    setTheme,
    themes,
  };
}
