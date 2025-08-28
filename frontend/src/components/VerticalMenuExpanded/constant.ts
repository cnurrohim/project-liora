export const MENU = {
  MODE: {
    SLIDING: "sliding",
    CONTEXT: "context",
  },
  ALIGNMENT: {
    START: "start",
    END: "end",
  },
  TYPE: {
    ROUTE: "route",
    COMMAND: "command",
    GROUP: "group",
  },
} as const;

export const API_URL = import.meta.env.VITE_API_BASE_URL;

export const USER_DIR = `${API_URL}/public/uploads/profile-photo/`;
