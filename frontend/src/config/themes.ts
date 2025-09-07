export const themes = [
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
  { id: "monokai-dark", label: "Monokai Dark" },
  { id: "solarized-dark", label: "Solarized Dark" },
  { id: "chrome-dark", label: "Chrome Dark" },
  { id: "ocean-blue-serenity", label: "Ocean Blue Serenity" },
  { id: "ocean-blue-serenity-light", label: "Ocean Blue Serenity light" },
  { id: "vivid-night", label: "vivid Night" },
  { id: "vivid-night-light", label: "vivid Night Light" },
  { id: "military", label: "Military" },
  { id: "military-dark", label: "Military Dark" },
] as const;

export type ThemeId = (typeof themes)[number]["id"];
