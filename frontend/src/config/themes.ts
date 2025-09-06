// src/config/themes.ts
export const themes = [
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
  { id: "monokai-dark", label: "Monokai Dark" },
  { id: "solarized-dark", label: "Solarized Dark" },
] as const;

export type ThemeId = (typeof themes)[number]["id"];
