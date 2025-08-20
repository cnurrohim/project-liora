// src/routes/logistics/index.ts
import { Hono } from "hono";
import { itemRoute } from "./item.route.js";
import { locationRoute } from "./location.route.js";
import { supplierRoute } from "./supplier.route.js";
import { stockMovementRoute } from "./stockMovement.route.js";
import { stockOpnameRoute } from "./stockOpname.route.js";
import { purchaseOrderRoute } from "./purchaseOrder.route.js";
import { salesOrderRoute } from "./salesOrder.route.js";
import { purchaseOrderItemRoute } from "./purchaseOrderItem.route.js";
import { poReceiveRoute } from "./purchaseOrderReceive.route.js";
import { purchaseReturnRoute } from "./purchaseReturn.route.js";
import { purchaseReturnItemRoute } from "./purchaseReturnItem.route.js";
import { goodsReceiptRoute } from "./goodsReceipt.route.js";

export const logisticsRoute = new Hono();

logisticsRoute.route("/locations", locationRoute);
logisticsRoute.route("/suppliers", supplierRoute);
logisticsRoute.route("/items", itemRoute);
logisticsRoute.route("/stock-movements", stockMovementRoute);
logisticsRoute.route("/stock-opname", stockOpnameRoute);
logisticsRoute.route("/purchase-orders", purchaseOrderRoute);
logisticsRoute.route("/purchase-order-items", purchaseOrderItemRoute);
logisticsRoute.route("/purchase-order-recieve", poReceiveRoute);
logisticsRoute.route("/purchase-return", purchaseReturnRoute);
logisticsRoute.route("/purchase-return-item", purchaseReturnItemRoute);
logisticsRoute.route("/sales-orders", salesOrderRoute);

logisticsRoute.route("/goods-receipts", goodsReceiptRoute);
