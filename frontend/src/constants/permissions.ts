export const PERMISSIONS = {
  DEV: {
    ALL_ACCESS: "dev.all_access",
  },
  SUPERADMIN: {
    ALL_ACCESS: "superadmin.all_access",
  },
  USER: {
    VIEW: "user.view",
    CREATE: "user.create",
    UPDATE: "user.update",
    DELETE: "user.delete",
  },
  DEPARTMENT: {
    VIEW: "department.view",
    CREATE: "department.create",
    UPDATE: "department.update",
    DELETE: "department.delete",
  },
  ROLE: {
    VIEW: "role.view",
    CREATE: "role.create",
    UPDATE: "role.update",
    DELETE: "role.delete",
  },
  PREFERENCES: {
    VIEW: "preferences.view",
    CREATE: "preferences.create",
    UPDATE: "preferences.update",
    DELETE: "preferences.delete",
  },
  MENU: {
    VIEW: "menu.view",
    CREATE: "menu.create",
    UPDATE: "menu.update",
    DELETE: "menu.delete",
  },
  APP_SETTING: {
    VIEW: "app_setting.view",
    CREATE: "app_setting.create",
    UPDATE: "app_setting.update",
    DELETE: "app_setting.delete",
  },
} as const;
