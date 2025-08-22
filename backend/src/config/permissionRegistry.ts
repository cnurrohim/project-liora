export const permissionRegistry = [
  {
    domain: "dev",
    name: "all_access",
    label: "DEV/IT",
    description: "Bisa akses semua",
  },
  {
    domain: "superadmin",
    name: "all_access",
    label: "Administrator",
    description: "Bisa akses semua",
  },

  /** USER */
  {
    domain: "user",
    name: "view",
    label: "buka halaman users management",
    description: "Bisa membuka halaman management users",
  },
  {
    domain: "user",
    name: "delete",
    label: "hapus user",
    description: "Bisa menghapus user",
  },
  {
    domain: "user",
    name: "update",
    label: "mengubah user",
    description: "Bisa mengubah user",
  },
  {
    domain: "user",
    name: "create",
    label: "menambahkan user baru",
    description: "Bisa menambahkan user baru",
  },

  /** ROLE */
  {
    domain: "role",
    name: "view",
    label: "buka halaman role management",
    description: "Bisa membuka halaman management role",
  },
  {
    domain: "role",
    name: "delete",
    label: "hapus roles",
    description: "Bisa menghapus role",
  },
  {
    domain: "role",
    name: "update",
    label: "mengubah roles",
    description: "Bisa mengubah role",
  },
  {
    domain: "role",
    name: "create",
    label: "menambahkan roles baru",
    description: "Bisa menambahkan roles baru",
  },

  /** DEPARTMENT */
  {
    domain: "department",
    name: "view",
    label: "buka halaman department management",
    description: "Bisa membuka halaman management department",
  },
  {
    domain: "department",
    name: "delete",
    label: "hapus department",
    description: "Bisa menghapus department",
  },
  {
    domain: "department",
    name: "update",
    label: "mengubah department",
    description: "Bisa mengubah department",
  },
  {
    domain: "department",
    name: "create",
    label: "menambahkan department baru",
    description: "Bisa menambahkan department baru",
  },

  /** PREFERENCES */
  {
    domain: "preferences",
    name: "view",
    label: "buka halaman preferences management",
    description: "Bisa membuka halaman management preferences",
  },
  {
    domain: "preferences",
    name: "delete",
    label: "hapus preferences",
    description: "Bisa menghapus preferences",
  },
  {
    domain: "preferences",
    name: "update",
    label: "mengubah preferences",
    description: "Bisa mengubah preferences",
  },
  {
    domain: "preferences",
    name: "create",
    label: "menambahkan preferences baru",
    description: "Bisa menambahkan preferences baru",
  },

  /** MENU */
  {
    domain: "menu",
    name: "view",
    label: "buka halaman menu management",
    description: "Bisa membuka halaman management menu",
  },
  {
    domain: "menu",
    name: "delete",
    label: "hapus menu",
    description: "Bisa menghapus menu",
  },
  {
    domain: "menu",
    name: "update",
    label: "mengubah menu",
    description: "Bisa mengubah menu",
  },
  {
    domain: "menu",
    name: "create",
    label: "menambahkan menu baru",
    description: "Bisa menambahkan menu baru",
  },

  /** APP SETTINGS */
  {
    domain: "app_setting",
    name: "view",
    label: "buka halaman app setting management",
    description: "Bisa membuka halaman management app setting",
  },
  {
    domain: "app_setting",
    name: "delete",
    label: "hapus app setting",
    description: "Bisa menghapus app setting",
  },
  {
    domain: "app_setting",
    name: "update",
    label: "mengubah app setting",
    description: "Bisa mengubah app setting",
  },
  {
    domain: "app_setting",
    name: "create",
    label: "menambahkan app setting baru",
    description: "Bisa menambahkan app setting baru",
  },

  /** USER PROFILE */
  {
    domain: "user_profile",
    name: "view",
    label: "buka halaman form user profile",
    description: "Bisa membuka halaman user profile",
  },
  {
    domain: "user_profile",
    name: "delete",
    label: "hapus user profile",
    description: "Bisa menghapus user profile",
  },
  {
    domain: "user_profile",
    name: "update",
    label: "mengubah user profile",
    description: "Bisa mengubah user profile",
  },
  {
    domain: "user_profile",
    name: "create",
    label: "menambahkan user profile baru",
    description: "Bisa menambahkan user profile baru",
  },

  /** LOGISTICS USE CASE */
  /** STOCK-LOCATION */
  {
    domain: "stock_location",
    name: "view",
    label: "buka halaman form stock location",
    description: "Bisa membuka halaman stock location",
  },
  {
    domain: "stock_location",
    name: "delete",
    label: "hapus stock location",
    description: "Bisa menghapus stock location",
  },
  {
    domain: "stock_location",
    name: "update",
    label: "mengubah stock location",
    description: "Bisa mengubah stock location",
  },
  {
    domain: "stock_location",
    name: "create",
    label: "menambahkan stock location baru",
    description: "Bisa menambahkan stock location baru",
  },

  /** ITEM */
  {
    domain: "item",
    name: "view",
    label: "buka halaman form item",
    description: "Bisa membuka halaman item",
  },
  {
    domain: "item",
    name: "delete",
    label: "hapus item",
    description: "Bisa menghapus item",
  },
  {
    domain: "item",
    name: "update",
    label: "mengubah item",
    description: "Bisa mengubah item",
  },
  {
    domain: "item",
    name: "create",
    label: "menambahkan item baru",
    description: "Bisa menambahkan item baru",
  },

  /** SUPPLIER */
  {
    domain: "supplier",
    name: "view",
    label: "buka halaman form supplier",
    description: "Bisa membuka halaman supplier",
  },
  {
    domain: "supplier",
    name: "delete",
    label: "hapus supplier",
    description: "Bisa menghapus supplier",
  },
  {
    domain: "supplier",
    name: "update",
    label: "mengubah supplier",
    description: "Bisa mengubah supplier",
  },
  {
    domain: "supplier",
    name: "create",
    label: "menambahkan supplier baru",
    description: "Bisa menambahkan supplier baru",
  },

  /** PURCHASE ORDER */
  {
    domain: "purchase_order",
    name: "view",
    label: "buka halaman form purchase order",
    description: "Bisa membuka halaman purchase order",
  },
  {
    domain: "purchase_order",
    name: "delete",
    label: "hapus purchase order",
    description: "Bisa menghapus purchase order",
  },
  {
    domain: "purchase_order",
    name: "update",
    label: "mengubah purchase order",
    description: "Bisa mengubah purchase order",
  },
  {
    domain: "purchase_order",
    name: "create",
    label: "menambahkan purchase order baru",
    description: "Bisa menambahkan purchase order baru",
  },
  {
    domain: "purchase_order",
    name: "approve",
    label: "approve purchase order",
    description: "Bisa approve purchase order baru",
  },
  {
    domain: "purchase_order",
    name: "receive",
    label: "receive purchase order items",
    description: "Bisa receive purchase order items",
  },
  {
    domain: "purchase_order",
    name: "cancel",
    label: "cancel purchase order items",
    description: "Bisa cancel purchase order items",
  },

  /** GOODS RECEIPTS */
  {
    domain: "goods_receipts",
    name: "view",
    label: "buka halaman form goods receipts",
    description: "Bisa membuka halaman goods receipts",
  },
  {
    domain: "goods_receipts",
    name: "delete",
    label: "hapus goods receipts",
    description: "Bisa menghapus goods receipts",
  },
  {
    domain: "goods_receipts",
    name: "update",
    label: "mengubah goods receipts",
    description: "Bisa mengubah goods receipts",
  },
  {
    domain: "goods_receipts",
    name: "create",
    label: "menambahkan goods receipts baru",
    description: "Bisa menambahkan goods receipts baru",
  },
  {
    domain: "goods_receipts",
    name: "approve",
    label: "approve goods receipts",
    description: "Bisa approve goods receipts baru",
  },
  {
    domain: "goods_receipts",
    name: "receive",
    label: "receive goods receipts",
    description: "Bisa receive goods receipts",
  },
  {
    domain: "goods_receipts",
    name: "cancel",
    label: "cancel goods receipts",
    description: "Bisa cancel goods receipts",
  },
];
