export const permissionRegistry = [
  {
    domain: "dev",
    name: "all_access",
    label: "DEV/IT",
    description: "Has access to all features",
  },
  {
    domain: "superadmin",
    name: "all_access",
    label: "Administrator",
    description: "Has access to all features",
  },

  /** USER */
  {
    domain: "user",
    name: "view",
    label: "Open User Management Page",
    description: "Can open the user management page",
  },
  {
    domain: "user",
    name: "delete",
    label: "Delete User",
    description: "Able to delete user",
  },
  {
    domain: "user",
    name: "update",
    label: "Update User",
    description: "Can update user details",
  },
  {
    domain: "user",
    name: "create",
    label: "Create New User",
    description: "Can create a new user",
  },

  /** ROLE */
  {
    domain: "role",
    name: "view",
    label: "Open Role Management Page",
    description: "Can open the role management page",
  },
  {
    domain: "role",
    name: "delete",
    label: "Delete Role",
    description: "Able to delete role",
  },
  {
    domain: "role",
    name: "update",
    label: "Update Role",
    description: "Can update role details",
  },
  {
    domain: "role",
    name: "create",
    label: "Create New Role",
    description: "Can create a new role",
  },

  /** DEPARTMENT */
  {
    domain: "department",
    name: "view",
    label: "Open Department Management Page",
    description: "Can open the department management page",
  },
  {
    domain: "department",
    name: "delete",
    label: "Delete Department",
    description: "Able to delete department",
  },
  {
    domain: "department",
    name: "update",
    label: "Update Department",
    description: "Can update department details",
  },
  {
    domain: "department",
    name: "create",
    label: "Create New Department",
    description: "Can create a new department",
  },

  /** PREFERENCES */
  {
    domain: "preferences",
    name: "view",
    label: "Open Preferences Management Page",
    description: "Can open the preferences management page",
  },
  {
    domain: "preferences",
    name: "delete",
    label: "Delete Preferences",
    description: "Able to delete preferences",
  },
  {
    domain: "preferences",
    name: "update",
    label: "Update Preferences",
    description: "Can update preferences",
  },
  {
    domain: "preferences",
    name: "create",
    label: "Create New Preferences",
    description: "Can create new preferences",
  },

  /** MENU */
  {
    domain: "menu",
    name: "view",
    label: "Open Menu Management Page",
    description: "Can open the menu management page",
  },
  {
    domain: "menu",
    name: "delete",
    label: "Delete Menu",
    description: "Able to delete menu",
  },
  {
    domain: "menu",
    name: "update",
    label: "Update Menu",
    description: "Can update menu",
  },
  {
    domain: "menu",
    name: "create",
    label: "Create New Menu",
    description: "Can create a new menu",
  },

  /** APP SETTINGS */
  {
    domain: "app_setting",
    name: "view",
    label: "Open App Setting Management Page",
    description: "Can open the app setting management page",
  },
  {
    domain: "app_setting",
    name: "delete",
    label: "Delete App Setting",
    description: "Able to delete app setting",
  },
  {
    domain: "app_setting",
    name: "update",
    label: "Update App Setting",
    description: "Can update app setting",
  },
  {
    domain: "app_setting",
    name: "create",
    label: "Create New App Setting",
    description: "Can create a new app setting",
  },

  /** USER PROFILE */
  {
    domain: "user_profile",
    name: "view",
    label: "Open User Profile Page",
    description: "Can open the user profile page",
  },
  {
    domain: "user_profile",
    name: "delete",
    label: "Delete User Profile",
    description: "Able to delete user profile",
  },
  {
    domain: "user_profile",
    name: "update",
    label: "Update User Profile",
    description: "Can update user profile",
  },
  {
    domain: "user_profile",
    name: "create",
    label: "Create New User Profile",
    description: "Can create a new user profile",
  },

  /** INVENTORY USE CASE */
  /** INVENTORY-LOCATION */
  {
    domain: "inventory_location",
    name: "view",
    label: "Open Inventory Location Page",
    description: "Can open the inventory location page",
  },
  {
    domain: "inventory_location",
    name: "delete",
    label: "Delete Inventory Location",
    description: "Able to delete inventory location",
  },
  {
    domain: "inventory_location",
    name: "update",
    label: "Update Inventory Location",
    description: "Can update inventory location",
  },
  {
    domain: "inventory_location",
    name: "create",
    label: "Create New Inventory Location",
    description: "Can create a new inventory location",
  },

  /** ITEM DETAIL */
  {
    domain: "item_detail",
    name: "view",
    label: "Open Item detail Page",
    description: "Can open the item detail page",
  },

  /** ITEM */
  {
    domain: "item",
    name: "view",
    label: "Open Item Page",
    description: "Can open the item page",
  },
  {
    domain: "item",
    name: "delete",
    label: "Delete Item",
    description: "Able to delete item",
  },
  {
    domain: "item",
    name: "update",
    label: "Update Item",
    description: "Can update item",
  },
  {
    domain: "item",
    name: "create",
    label: "Create New Item",
    description: "Can create a new item",
  },

  /** SUPPLIER */
  {
    domain: "supplier",
    name: "view",
    label: "Open Supplier Page",
    description: "Can open the supplier page",
  },
  {
    domain: "supplier",
    name: "delete",
    label: "Delete Supplier",
    description: "Able to delete supplier",
  },
  {
    domain: "supplier",
    name: "update",
    label: "Update Supplier",
    description: "Can update supplier",
  },
  {
    domain: "supplier",
    name: "create",
    label: "Create New Supplier",
    description: "Can create a new supplier",
  },

  /** PURCHASE ORDER */
  {
    domain: "purchase_order",
    name: "view",
    label: "Open Purchase Order Page",
    description: "Can open the purchase order page",
  },
  {
    domain: "purchase_order",
    name: "delete",
    label: "Delete Purchase Order",
    description: "Able to delete purchase order",
  },
  {
    domain: "purchase_order",
    name: "update",
    label: "Update Purchase Order",
    description: "Can update purchase order",
  },
  {
    domain: "purchase_order",
    name: "create",
    label: "Create New Purchase Order",
    description: "Can create a new purchase order",
  },
  {
    domain: "purchase_order",
    name: "approve",
    label: "Approve Purchase Order",
    description: "Can approve new purchase order",
  },
  {
    domain: "purchase_order",
    name: "receive",
    label: "Receive Purchase Order Items",
    description: "Can receive purchase order items",
  },
  {
    domain: "purchase_order",
    name: "cancel",
    label: "Cancel Purchase Order",
    description: "Can cancel purchase order items",
  },

  /** GOODS ISSUES */
  {
    domain: "goods_issue",
    name: "view",
    label: "Open Goods Issues Page",
    description: "Can open the goods issues page",
  },
  {
    domain: "goods_issue",
    name: "delete",
    label: "Delete Goods Issues",
    description: "Able to delete goods issues",
  },
  {
    domain: "goods_issue",
    name: "update",
    label: "Update Goods Issues",
    description: "Can update goods issues",
  },
  {
    domain: "goods_issue",
    name: "create",
    label: "Create New Goods Issue",
    description: "Can create a new goods issue",
  },
  {
    domain: "goods_issue",
    name: "approve",
    label: "Approve Goods Issues",
    description: "Can approve new goods issues",
  },
  {
    domain: "goods_issue",
    name: "receive",
    label: "Receive Goods Issues",
    description: "Can receive goods issues",
  },
  {
    domain: "goods_issue",
    name: "cancel",
    label: "Cancel Goods Issues",
    description: "Can cancel goods issues",
  },

  /** GOODS RECEIPTS */
  {
    domain: "goods_receipts",
    name: "view",
    label: "Open Goods Receipts Page",
    description: "Can open the goods receipts page",
  },
  {
    domain: "goods_receipts",
    name: "delete",
    label: "Delete Goods Receipts",
    description: "Able to delete goods receipts",
  },
  {
    domain: "goods_receipts",
    name: "update",
    label: "Update Goods Receipts",
    description: "Can update goods receipts",
  },
  {
    domain: "goods_receipts",
    name: "create",
    label: "Create New Goods Receipt",
    description: "Can create a new goods receipt",
  },
  {
    domain: "goods_receipts",
    name: "approve",
    label: "Approve Goods Receipts",
    description: "Can approve new goods receipts",
  },
  {
    domain: "goods_receipts",
    name: "receive",
    label: "Receive Goods Receipts",
    description: "Can receive goods receipts",
  },
  {
    domain: "goods_receipts",
    name: "cancel",
    label: "Cancel Goods Receipts",
    description: "Can cancel goods receipts",
  },

  /** INVENTORY ADJUSTMENT */
  {
    domain: "inventory_adjustment",
    name: "view",
    label: "Open Inventory Adjustment Page",
    description: "Can open the inventory adjustment page",
  },
  {
    domain: "inventory_adjustment",
    name: "delete",
    label: "Delete Inventory Adjustment",
    description: "Able to delete inventory adjustment",
  },
  {
    domain: "inventory_adjustment",
    name: "update",
    label: "Update Inventory Adjustment",
    description: "Can update inventory adjustment",
  },
  {
    domain: "inventory_adjustment",
    name: "create",
    label: "Create New Inventory Adjustment",
    description: "Can create a new inventory adjustment",
  },
  {
    domain: "inventory_adjustment",
    name: "approve",
    label: "Approve Inventory Adjustment",
    description: "Can approve new inventory adjustment",
  },
  {
    domain: "inventory_adjustment",
    name: "cancel",
    label: "Cancel Inventory Adjustment",
    description: "Can cancel inventory adjustment",
  },

  /** INVENTORY OPNAME */
  {
    domain: "inventory_opname",
    name: "view",
    label: "Open Inventory Opname Page",
    description: "Can open the inventory opname page",
  },
  {
    domain: "inventory_opname",
    name: "delete",
    label: "Delete Inventory Opname",
    description: "Able to delete inventory opname",
  },
  {
    domain: "inventory_opname",
    name: "update",
    label: "Update Inventory Opname",
    description: "Can update inventory opname",
  },
  {
    domain: "inventory_opname",
    name: "create",
    label: "Create New Inventory Opname",
    description: "Can create a new inventory opname",
  },
  {
    domain: "inventory_opname",
    name: "approve",
    label: "Approve Inventory Opname",
    description: "Can approve new inventory opname",
  },
  {
    domain: "inventory_opname",
    name: "review",
    label: "Review Inventory Opname",
    description: "Can review inventory opname",
  },
  {
    domain: "inventory_opname",
    name: "cancel",
    label: "Cancel Inventory Opname",
    description: "Can cancel inventory opname",
  },

  /** REPORT */
  {
    domain: "monitoring_inventory_movements",
    name: "view",
    label: "View Inventory Movements Ledger",
    description: "View inventory movements ledger",
  },
  {
    domain: "monitoring_inventory_on_hand",
    name: "view",
    label: "View Inventory On Hand",
    description: "View inventory on hand",
  },
  {
    domain: "monitoring_inventory_location",
    name: "view",
    label: "View Inventory Location",
    description: "View inventory location",
  },
  {
    domain: "report_inventory_history",
    name: "view",
    label: "View Inventory History",
    description: "View inventory history",
  },
  {
    domain: "report_po_summary",
    name: "view",
    label: "View PO Summary",
    description: "View PO summary",
  },

  /** DASHBOARD */
  {
    domain: "dashboard",
    name: "view",
    label: "Open Dashboard Management Page",
    description: "Can open the dashboard management page",
  },
  {
    domain: "dashboard",
    name: "delete",
    label: "Delete Dashboard",
    description: "Able to delete dashboard",
  },
  {
    domain: "dashboard",
    name: "update",
    label: "Update Dashboard",
    description: "Can update dashboard",
  },
  {
    domain: "dashboard",
    name: "create",
    label: "Create New Dashboard",
    description: "Can create a new dashboard",
  },
];
