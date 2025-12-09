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
    VIEW: "inventory_location.view",
    CREATE: "inventory_location.create",
    UPDATE: "inventory_location.update",
    DELETE: "inventory_location.delete",
  },

  ITEM: {
    VIEW: "item.view",
    CREATE: "item.create",
    UPDATE: "item.update",
    DELETE: "item.delete",
  },

  ITEM_DETAIL: {
    VIEW: "item_detail.view",
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
    APPROVE: "goods_issue.approve",
    RECEIVE: "goods_issue.receive",
  },

  INVENTORY_ADJUSTMENT: {
    VIEW: "inventory_adjustment.view",
    CREATE: "inventory_adjustment.create",
    UPDATE: "inventory_adjustment.update",
    DELETE: "inventory_adjustment.delete",
    APPROVE: "inventory_adjustment.approve",
    CANCEL: "inventory_adjustment.cancel",
  },

  INVENTORY_OPNAME: {
    VIEW: "inventory_opname.view",
    CREATE: "inventory_opname.create",
    UPDATE: "inventory_opname.update",
    DELETE: "inventory_opname.delete",
    APPROVE: "inventory_opname.approve",
    REVIEW: "inventory_opname.review",
    CANCEL: "inventory_opname.cancel",
  },

  DASHBOARD: {
    VIEW: "dashboard.view",
    CREATE: "dashboard.create",
    UPDATE: "dashboard.update",
    DELETE: "dashboard.delete",
  },

  MONITORING_INVENTORY_MOVEMENT: {
    VIEW: "monitoring_inventory_movements.view",
  },
  MONITORING_INVENTORY_ON_HAND: { VIEW: "monitoring_inventory_on_hands.view" },
  MONITORING_INVENTORY_LOCATION: { VIEW: "monitoring_inventory_location.view" },
  REPORT_INVENTORY_HISTORY: { VIEW: "report_inventory_history.view" },
  REPORT_PO_SUMMARY: { VIEW: "report_po_summary.view" },
} as const;
