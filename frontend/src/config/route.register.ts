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
    React.createElement(DefaultPage)
  );

  RouteRegistry.register(
    "/pages/list-launcher",
    "list app launcher",
    React.createElement(ListLauncher)
  );

  RouteRegistry.register(
    "/pages/boxy-launcher",
    "boxy app launcher",
    React.createElement(BoxyLauncher)
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

  /** INVENTORY USE CASE */
  RouteRegistry.register(
    "/pages/inventory/stock-location",
    "list stock locations",
    React.createElement(StockLocationsListPage)
  );

  RouteRegistry.register(
    "/stock-location/create",
    "create new stock location",
    React.createElement(StockLocationsFormPage)
  );

  RouteRegistry.register(
    "/pages/inventory/item",
    "list available item",
    React.createElement(ItemListPage)
  );

  RouteRegistry.register(
    "/item/create",
    "create new item",
    React.createElement(ItemFormPage)
  );

  RouteRegistry.register(
    "/pages/inventory/supplier",
    "list available supplier",
    React.createElement(SupplierListPage)
  );

  RouteRegistry.register(
    "/supplier/create",
    "create new supplier",
    React.createElement(SupplierFormPage)
  );

  RouteRegistry.register(
    "/pages/inventory/purchase-order",
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
    "/pages/inventory/goods-receipts",
    "list goods receipts",
    React.createElement(GoodsReceiptListPage)
  );

  RouteRegistry.register(
    "/pages/inventory/goods-issues",
    "list goods issues",
    React.createElement(GoodsIssueListPage)
  );

  RouteRegistry.register(
    "/goods-issues/create",
    "Issue Goods Inbound or Outbound",
    React.createElement(GoodsIssueFormPage)
  );

  RouteRegistry.register(
    "/pages/inventory/stock-adjustments",
    "list stock adjustments",
    React.createElement(StockAdjustmentListPage)
  );

  RouteRegistry.register(
    "/stock-adjustment/create",
    "stock adjustment form",
    React.createElement(StockAdjustmentFormPage)
  );

  RouteRegistry.register(
    "/pages/inventory/stock-opnames",
    "list stock opnames",
    React.createElement(StockOpnameListPage)
  );

  RouteRegistry.register(
    "/stock-opname/create",
    "stock opname form",
    React.createElement(StockOpnameFormPage)
  );

  RouteRegistry.register(
    "/stock-opname/:id/edit",
    "stock opname edit form",
    React.createElement(StockOpnameFormPage)
  );

  RouteRegistry.register(
    "/stock-opname/:id/review",
    "stock opname review form",
    React.createElement(StockOpnameFormPage)
  );

  RouteRegistry.register(
    "/pages/inventory/stock-movements",
    "Stock Movements",
    React.createElement(StockMovementListPage)
  );

  RouteRegistry.register(
    "/pages/inventory/stock-on-hand",
    "Stock On Hand",
    React.createElement(StockOnHandListPage)
  );

  RouteRegistry.register(
    "/pages/inventory/po-summary",
    "Purchase Order Summary",
    React.createElement(POSummaryListPage)
  );

  RouteRegistry.register(
    "/pages/inventory/stock-history-report/",
    "Stock History",
    React.createElement(StockHistoryReportPage)
  );

  RouteRegistry.register(
    "/pages/inventory/stock-location-report",
    "Stock Per Location",
    React.createElement(StockLocationReportPage)
  );
}
