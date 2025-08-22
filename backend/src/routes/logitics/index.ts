// src/routes/logistics/index.ts
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

export const logisticsRoute = new Hono();

logisticsRoute.route("/stock-locations", stockLocationsRoute);
logisticsRoute.route("/suppliers", supplierRoute);
logisticsRoute.route("/items", itemRoute);
logisticsRoute.route("/stock-movements", stockMovementRoute);
logisticsRoute.route("/stock-opname", stockOpnameRoute);
logisticsRoute.route("/purchase-orders", purchaseOrderRoute);
logisticsRoute.route("/purchase-order-items", purchaseOrderItemRoute);
logisticsRoute.route("/purchase-order-recieve", poReceiveRoute);
logisticsRoute.route("/goods-receipts", goodsReceiptRoute);
logisticsRoute.route("/goods-issues", goodsIssueRoute);
