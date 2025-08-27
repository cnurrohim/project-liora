// src/routes/inventory/index.ts
import { Hono } from "hono";
import { itemRoute } from "./item.route.js";

import { supplierRoute } from "./supplier.route.js";
import { stockMovementRoute } from "./stockMovement.route.js";
import { stockOpnameRoute } from "./stockOpname.route.js";
import { purchaseOrderRoute } from "./purchaseOrder.route.js";
import { purchaseOrderItemRoute } from "./purchaseOrderItem.route.js";
import { poReceiveRoute } from "./purchaseOrderReceive.route.js";
import { goodsReceiptRoute } from "./goodsReceipt.route.js";
import { goodsIssueRoute } from "./goodsIssue.route.js";
import { stockLocationsRoute } from "./stockLocations.route.js";
import { stockAdjustmentRoute } from "./stockAdjustment.route.js";
import { stockOnHandRoute } from "./stockOnHand.route.js";
import { poSummaryRoute } from "./poSummary.route.js";
import { stockHistoryReportRoute } from "./stockHistoryReport.route.js";
import { stockLocationReportRoute } from "./stockLocationReport.route.js";

export const inventoryRoute = new Hono();

inventoryRoute.route("/stock-locations", stockLocationsRoute);
inventoryRoute.route("/suppliers", supplierRoute);
inventoryRoute.route("/items", itemRoute);
inventoryRoute.route("/stock-movements", stockMovementRoute);
inventoryRoute.route("/stock-opname", stockOpnameRoute);
inventoryRoute.route("/purchase-orders", purchaseOrderRoute);
inventoryRoute.route("/purchase-order-items", purchaseOrderItemRoute);
inventoryRoute.route("/purchase-order-recieve", poReceiveRoute);
inventoryRoute.route("/goods-receipts", goodsReceiptRoute);
inventoryRoute.route("/goods-issues", goodsIssueRoute);
inventoryRoute.route("/stock-adjustments", stockAdjustmentRoute);
inventoryRoute.route("/stock-opnames", stockOpnameRoute);

inventoryRoute.route("/stock-on-hand", stockOnHandRoute);
inventoryRoute.route("/po-summary", poSummaryRoute);
inventoryRoute.route("/stock-history-report", stockHistoryReportRoute);
inventoryRoute.route("/stock-location-report", stockLocationReportRoute);
