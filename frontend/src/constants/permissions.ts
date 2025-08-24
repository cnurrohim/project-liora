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
  USER_PROFILE: {
    VIEW: "user_profile.view",
    CREATE: "user_profile.create",
    UPDATE: "user_profile.update",
    DELETE: "user_profile.delete",
  },

  /* INVENTORY USE CASE */
  LOCATION: {
    VIEW: "location.view",
    CREATE: "location.create",
    UPDATE: "location.update",
    DELETE: "location.delete",
  },

  ITEM: {
    VIEW: "item.view",
    CREATE: "item.create",
    UPDATE: "item.update",
    DELETE: "item.delete",
  },

  SUPPLIER: {
    VIEW: "supplier.view",
    CREATE: "supplier.create",
    UPDATE: "supplier.update",
    DELETE: "supplier.delete",
  },

  PURCHASE_ORDER: {
    VIEW: "purchase_order.view",
    CREATE: "purchase_order.create",
    UPDATE: "purchase_order.update",
    DELETE: "purchase_order.delete",
    APPROVE: "purchase_order.approve",
    RECEIVE: "purchase_order.receive",
    CANCEL: "purchase_order.cancel",
  },

  GOODS_RECEIPTS: {
    VIEW: "goods_receipts.view",
    CREATE: "goods_receipts.create",
    UPDATE: "goods_receipts.update",
    DELETE: "goods_receipts.delete",
    APPROVE: "goods_receipts.approve",
    RECEIVE: "goods_receipts.receive",
    CANCEL: "goods_receipts.cancel",
  },

  GOODS_ISSUE: {
    VIEW: "goods_issue.view",
    CREATE: "goods_issue.create",
    UPDATE: "goods_issue.update",
    DELETE: "goods_issue.delete",
    CANCEL: "goods_issue.cancel",
  },

  STOCK_ADJUSTMENT: {
    VIEW: "stock_adjustment.view",
    CREATE: "stock_adjustment.create",
    UPDATE: "stock_adjustment.update",
    DELETE: "stock_adjustment.delete",
    APPROVE: "stock_adjustment.approve",
    CANCEL: "stock_adjustment.cancel",
  },

  STOCK_OPNAME: {
    VIEW: "stock_opname.view",
    CREATE: "stock_opname.create",
    UPDATE: "stock_opname.update",
    DELETE: "stock_opname.delete",
    APPROVE: "stock_opname.approve",
    REVIEW: "stock_opname.review",
    CANCEL: "stock_opname.cancel",
  },
} as const;
