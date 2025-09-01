import React from "react";
import Preferences from "../pages/Preferences";
import { RouteRegistry } from "./routeRegistry";
import UserListPage from "../pages/User";
import RoleListPage from "../pages/role";
import RoleFormPage from "../pages/role/roleForm";
import MenuListPage from "../pages/Menu";
import MenuFormPage from "../pages/Menu/form";
import AppSettingPage from "../pages/AppSettings";
import ListLauncher from "../pages/Launcher/listLauncher";
import BoxyLauncher from "@/pages/Launcher/boxyLauncher";
import DefaultPage from "../pages/Misc/DefaultPage";
import DepartmentListPage from "../pages/Departments";
import DepartmentFormPage from "../pages/Departments/form";
import UserFormTabs from "../pages/User/UserFormTabs";
import UserProfilePage from "@/pages/UserProfile";
import ItemFormPage from "@/pages/Inventory/Item/ItemFormPage";
import ItemListPage from "@/pages/Inventory/Item/ItemListPage";
import SupplierListPage from "@/pages/Inventory/Supplier/SupplierListPage";
import SupplierFormPage from "@/pages/Inventory/Supplier/SupplierFormPage";
import PurchaseOrderListPage from "@/pages/Inventory/PurchaseOrder/PurchaseOrderListPage";
import PurchaseOrderFormPage from "@/pages/Inventory/PurchaseOrder/PurchaseOrderFormPage";
import PurchaseReceiveFormPage from "@/pages/Inventory/PurchaseOrder/PurchaseReceiveFormPage";
import PurchaseReceiveKiosk from "@/pages/Inventory/PurchaseOrder/PurchaseReceiveKiosk";
import GoodsReceiptFormPage from "@/pages/Inventory/GoodsReceipts/GoodsReceiptFormPage";
import GoodsReceiptListPage from "@/pages/Inventory/GoodsReceipts/GoodsReceiptListPage";
import GoodsIssueListPage from "@/pages/Inventory/GoodsIssue/GoodsIssueListPage";
import GoodsIssueFormPage from "@/pages/Inventory/GoodsIssue/GoodsIssueFormPage";
import StockLocationsFormPage from "@/pages/Inventory/stockLocations/form";
import StockLocationsListPage from "@/pages/Inventory/stockLocations/stockLocationsListPage";
import StockAdjustmentListPage from "@/pages/Inventory/StocksAdjustment/StockAdjustmentListPage";
import StockAdjustmentFormPage from "@/pages/Inventory/StocksAdjustment/StockAdjustmentFormPage";
import StockOpnameListPage from "@/pages/Inventory/StockOpname/StockOpnameListPage";
import StockOpnameFormPage from "@/pages/Inventory/StockOpname/StockOpnameFormPage";
import StockMovementListPage from "@/pages/Inventory/ReportStockMovement/StockMovementListPage";
import StockOnHandListPage from "@/pages/Inventory/ReportStockOnHand/StockOnHandListPage";
import POSummaryListPage from "@/pages/Inventory/ReportPurchaseSummary/POSummaryListPage";
import StockHistoryReportPage from "@/pages/Inventory/ReportStockHistory/StockHistoryReportPage";
import StockLocationReportPage from "@/pages/Inventory/ReportStockLocation/StockLocationReportPage";

export function registerRoutes() {
  RouteRegistry.register(
    "/pages/default",
    "Empty",
    React.createElement(DefaultPage),
    "default"
  );

  RouteRegistry.register(
    "/pages/list-launcher",
    "list app launcher",
    React.createElement(ListLauncher),
    "launcher"
  );

  RouteRegistry.register(
    "/pages/boxy-launcher",
    "boxy app launcher",
    React.createElement(BoxyLauncher),
    "launcher"
  );

  RouteRegistry.register(
    "/pages/app-settings",
    "app settings",
    React.createElement(AppSettingPage),
    "page"
  );

  RouteRegistry.register(
    "/pages/preferences",
    "preferences",
    React.createElement(Preferences),
    "page"
  );

  RouteRegistry.register(
    "/pages/departmemts",
    "list departments",
    React.createElement(DepartmentListPage),
    "page"
  );

  RouteRegistry.register(
    "/departments/create",
    "add new departments",
    React.createElement(DepartmentFormPage),
    "page"
  );

  RouteRegistry.register(
    "/departments/:id/edit",
    "edit department",
    React.createElement(DepartmentFormPage),
    "action"
  );

  RouteRegistry.register(
    "/pages/users",
    "list users",
    React.createElement(UserListPage),
    "page"
  );
  RouteRegistry.register(
    "/user/create",
    "create user",
    React.createElement(UserFormTabs),
    "page"
  );

  RouteRegistry.register(
    "/profile",
    "User Profile",
    React.createElement(UserProfilePage),
    "page"
  );

  RouteRegistry.register(
    "/user/:id/edit",
    "create user",
    React.createElement(UserFormTabs),
    "action"
  );

  RouteRegistry.register(
    "/pages/roles",
    "List Role",
    React.createElement(RoleListPage),
    "page"
  );
  RouteRegistry.register(
    "/roles/create",
    "create roles",
    React.createElement(RoleFormPage),
    "page"
  );
  RouteRegistry.register(
    "/roles/:id/edit",
    "edit roles",
    React.createElement(RoleFormPage),
    "action"
  );

  RouteRegistry.register(
    "/pages/menu",
    "list menu",
    React.createElement(MenuListPage),
    "page"
  );
  RouteRegistry.register(
    "/menu/create",
    "create menu",
    React.createElement(MenuFormPage),
    "page"
  );
  RouteRegistry.register(
    "/menu/:id/edit",
    "edit menu",
    React.createElement(MenuFormPage),
    "action"
  );

  /** INVENTORY USE CASE */
  RouteRegistry.register(
    "/pages/inventory/stock-location",
    "list stock locations",
    React.createElement(StockLocationsListPage),
    "page"
  );

  RouteRegistry.register(
    "/stock-location/create",
    "create new stock location",
    React.createElement(StockLocationsFormPage),
    "page"
  );

  RouteRegistry.register(
    "/pages/inventory/item",
    "list available item",
    React.createElement(ItemListPage),
    "page"
  );

  RouteRegistry.register(
    "/item/create",
    "create new item",
    React.createElement(ItemFormPage),
    "page"
  );

  RouteRegistry.register(
    "/pages/inventory/supplier",
    "list available supplier",
    React.createElement(SupplierListPage),
    "page"
  );

  RouteRegistry.register(
    "/supplier/create",
    "create new supplier",
    React.createElement(SupplierFormPage),
    "page"
  );

  RouteRegistry.register(
    "/pages/inventory/purchase-order",
    "list purchase-order",
    React.createElement(PurchaseOrderListPage),
    "page"
  );

  RouteRegistry.register(
    "/purchase-order/create",
    "create new purchase-order",
    React.createElement(PurchaseOrderFormPage),
    "page"
  );

  RouteRegistry.register(
    "/purchase-order/:id/receive",
    "Receive PO",
    React.createElement(PurchaseReceiveFormPage),
    "action"
  );

  RouteRegistry.register(
    "/purchase-order/:id/edit",
    "Edit PO",
    React.createElement(PurchaseOrderFormPage),
    "action"
  );

  RouteRegistry.register(
    "/purchase-order/:id/kiosk",
    "Receive PO (KIOSK)",
    React.createElement(PurchaseReceiveKiosk),
    "action"
  );

  RouteRegistry.register(
    "/goods-receipts/create",
    "create new goods receipts",
    React.createElement(GoodsReceiptFormPage),
    "page"
  );

  RouteRegistry.register(
    "/pages/inventory/goods-receipts",
    "list goods receipts",
    React.createElement(GoodsReceiptListPage),
    "page"
  );

  RouteRegistry.register(
    "/pages/inventory/goods-issues",
    "list goods issues",
    React.createElement(GoodsIssueListPage),
    "page"
  );

  RouteRegistry.register(
    "/goods-issues/create",
    "Issue Goods Inbound or Outbound",
    React.createElement(GoodsIssueFormPage),
    "page"
  );

  RouteRegistry.register(
    "/pages/inventory/stock-adjustments",
    "list stock adjustments",
    React.createElement(StockAdjustmentListPage),
    "page"
  );

  RouteRegistry.register(
    "/stock-adjustment/create",
    "stock adjustment form",
    React.createElement(StockAdjustmentFormPage),
    "page"
  );

  RouteRegistry.register(
    "/pages/inventory/stock-opnames",
    "list stock opnames",
    React.createElement(StockOpnameListPage),
    "page"
  );

  RouteRegistry.register(
    "/stock-opname/create",
    "stock opname form",
    React.createElement(StockOpnameFormPage),
    "page"
  );

  RouteRegistry.register(
    "/stock-opname/:id/edit",
    "stock opname edit form",
    React.createElement(StockOpnameFormPage),
    "action"
  );

  RouteRegistry.register(
    "/stock-opname/:id/review",
    "stock opname review form",
    React.createElement(StockOpnameFormPage),
    "action"
  );

  RouteRegistry.register(
    "/pages/inventory/stock-movements",
    "Stock Movements",
    React.createElement(StockMovementListPage),
    "page"
  );

  RouteRegistry.register(
    "/pages/inventory/stock-on-hand",
    "Stock On Hand",
    React.createElement(StockOnHandListPage),
    "page"
  );

  RouteRegistry.register(
    "/pages/inventory/po-summary",
    "Purchase Order Summary",
    React.createElement(POSummaryListPage),
    "page"
  );

  RouteRegistry.register(
    "/pages/inventory/stock-history-report/",
    "Stock History",
    React.createElement(StockHistoryReportPage),
    "page"
  );

  RouteRegistry.register(
    "/pages/inventory/stock-location-report",
    "Stock Per Location",
    React.createElement(StockLocationReportPage),
    "page"
  );
}
