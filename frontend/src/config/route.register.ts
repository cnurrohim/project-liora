import React from "react";
import Preferences from "../pages/Preferences";
import { RouteRegistry } from "./routeRegistry";
import UserListPage from "../pages/User";
import RoleListPage from "../pages/role";
import RoleFormPage from "../pages/role/roleForm";
import MenuListPage from "../pages/Menu";
import MenuFormPage from "../pages/Menu/form";
import AppSettingPage from "../pages/AppSettings";
import AppLauncher from "../pages/Launcher";
import DefaultPage from "../pages/Misc/DefaultPage";
import DepartmentListPage from "../pages/Departments";
import DepartmentFormPage from "../pages/Departments/form";
import UserFormTabs from "../pages/User/UserFormTabs";
import UserProfilePage from "@/pages/UserProfile";
import ItemFormPage from "@/pages/Logictics/Item/ItemFormPage";
import ItemListPage from "@/pages/Logictics/Item/ItemListPage";
import SupplierListPage from "@/pages/Logictics/Supplier/SupplierListPage";
import SupplierFormPage from "@/pages/Logictics/Supplier/SupplierFormPage";
import PurchaseOrderListPage from "@/pages/Logictics/PurchaseOrder/PurchaseOrderListPage";
import PurchaseOrderFormPage from "@/pages/Logictics/PurchaseOrder/PurchaseOrderFormPage";
import PurchaseReceiveFormPage from "@/pages/Logictics/PurchaseOrder/PurchaseReceiveFormPage";
import PurchaseReceiveKiosk from "@/pages/Logictics/PurchaseOrder/PurchaseReceiveKiosk";
import GoodsReceiptFormPage from "@/pages/Logictics/GoodsReceipts/GoodsReceiptFormPage";
import GoodsReceiptListPage from "@/pages/Logictics/GoodsReceipts/GoodsReceiptListPage";
import GoodsIssueListPage from "@/pages/Logictics/GoodsIssue/GoodsIssueListPage";
import GoodsIssueFormPage from "@/pages/Logictics/GoodsIssue/GoodsIssueFormPage";
import StockLocationsFormPage from "@/pages/Logictics/stockLocations/form";
import StockLocationsListPage from "@/pages/Logictics/stockLocations/stockLocationsListPage";

export function registerRoutes() {
  RouteRegistry.register(
    "/pages/default",
    "Empty",
    React.createElement(DefaultPage)
  );
  RouteRegistry.register(
    "/pages/launcher",
    "default app launcher",
    React.createElement(AppLauncher)
  );

  RouteRegistry.register(
    "/pages/app-settings",
    "app settings",
    React.createElement(AppSettingPage)
  );

  RouteRegistry.register(
    "/pages/preferences",
    "preferences",
    React.createElement(Preferences)
  );

  RouteRegistry.register(
    "/pages/departmemts",
    "list departments",
    React.createElement(DepartmentListPage)
  );

  RouteRegistry.register(
    "/departments/create",
    "add new departments",
    React.createElement(DepartmentFormPage)
  );

  RouteRegistry.register(
    "/departments/:id/edit",
    "edit department",
    React.createElement(DepartmentFormPage)
  );

  RouteRegistry.register(
    "/pages/users",
    "list users",
    React.createElement(UserListPage)
  );
  RouteRegistry.register(
    "/user/create",
    "create user",
    React.createElement(UserFormTabs)
  );

  RouteRegistry.register(
    "/profile",
    "User Profile",
    React.createElement(UserProfilePage)
  );

  RouteRegistry.register(
    "/user/:id/edit",
    "create user",
    React.createElement(UserFormTabs)
  );

  RouteRegistry.register(
    "/pages/roles",
    "Edit User",
    React.createElement(RoleListPage)
  );
  RouteRegistry.register(
    "/roles/create",
    "create roles",
    React.createElement(RoleFormPage)
  );
  RouteRegistry.register(
    "/roles/:id/edit",
    "edit roles",
    React.createElement(RoleFormPage)
  );

  RouteRegistry.register(
    "/pages/menu",
    "list menu",
    React.createElement(MenuListPage)
  );
  RouteRegistry.register(
    "/menu/create",
    "create menu",
    React.createElement(MenuFormPage)
  );
  RouteRegistry.register(
    "/menu/:id/edit",
    "edit menu",
    React.createElement(MenuFormPage)
  );

  /** LOGITICS USE CASE */
  RouteRegistry.register(
    "/pages/logitics/stock-location",
    "list stock locations",
    React.createElement(StockLocationsListPage)
  );

  RouteRegistry.register(
    "/stock-location/create",
    "create new stock location",
    React.createElement(StockLocationsFormPage)
  );

  RouteRegistry.register(
    "/pages/logitics/item",
    "list available item",
    React.createElement(ItemListPage)
  );

  RouteRegistry.register(
    "/item/create",
    "create new item",
    React.createElement(ItemFormPage)
  );

  RouteRegistry.register(
    "/pages/logitics/supplier",
    "list available supplier",
    React.createElement(SupplierListPage)
  );

  RouteRegistry.register(
    "/supplier/create",
    "create new supplier",
    React.createElement(SupplierFormPage)
  );

  RouteRegistry.register(
    "/pages/logitics/purchase-order",
    "list purchase-order",
    React.createElement(PurchaseOrderListPage)
  );

  RouteRegistry.register(
    "/purchase-order/create",
    "create new purchase-order",
    React.createElement(PurchaseOrderFormPage)
  );

  RouteRegistry.register(
    "/purchase-order/:id/receive",
    "Receive PO",
    React.createElement(PurchaseReceiveFormPage)
  );

  RouteRegistry.register(
    "/purchase-order/:id/edit",
    "Edit PO",
    React.createElement(PurchaseOrderFormPage)
  );

  RouteRegistry.register(
    "/purchase-order/:id/kiosk",
    "Receive PO (KIOSK)",
    React.createElement(PurchaseReceiveKiosk)
  );

  RouteRegistry.register(
    "/goods-receipts/create",
    "create new goods receipts",
    React.createElement(GoodsReceiptFormPage)
  );

  RouteRegistry.register(
    "/pages/logitics/goods-receipts",
    "list goods receipts",
    React.createElement(GoodsReceiptListPage)
  );

  RouteRegistry.register(
    "/pages/logitics/goods-issues",
    "list goods issues",
    React.createElement(GoodsIssueListPage)
  );

  RouteRegistry.register(
    "/goods-issues/create",
    "Issue Goods Inbound or Outbound",
    React.createElement(GoodsIssueFormPage)
  );
}
