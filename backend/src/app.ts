import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { authRoute } from "./routes/core/auth.js";
import { userRoute } from "./routes/core/users.js";
import { roleRoute } from "./routes/core/role.js";
import { permissionRoute } from "./routes/core/permissions.js";
import type { Variables } from "./types/context.js";
import { menuRoute } from "./routes/core/menu.js";
import { userLayoutRoute } from "./routes/core/userLayoutRoute.js";
import { appSettingsRoute } from "./routes/core/appSettings.js";
import { serveStatic } from "@hono/node-server/serve-static";
import { departmentRoute } from "./routes/core/departments.js";
import { pinnedMenusRoute } from "./routes/core/pinnedMenus.js";
import { profileRoute } from "./routes/core/profile.js";
import { inventoryRoute } from "./routes/inventory/index.js";
import { userDashboardRoute } from "./routes/core/userDashboardRoute.js";
import { widgetRoute } from "./routes/inventory/widget.route.js";

export const app = new Hono<{ Variables: Variables }>();

app.use("/uploads/*", serveStatic({ root: "./public" }));

const corsOrigins = JSON.parse(process.env.CORS_ORIGIN || "[]");

app.use(
  "*",
  cors({
    origin: (origin) => {
      if (!origin) return origin;
      if (corsOrigins.includes(origin)) {
        return origin; // ⬅️ PENTING: echo exact origin
      }
      return null;
    },
    allowHeaders: ["Authorization", "Content-Type"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    credentials: true,
  })
);

app.options("*", (c) => c.body(null, 204));

app.route("/app-setting", appSettingsRoute);
app.route("/auth", authRoute);
app.route("/users", userRoute);
app.route("/menu", menuRoute);
app.route("/user-layout", userLayoutRoute);
app.route("/user-dashboard", userDashboardRoute);

app.route("/roles", roleRoute);
app.route("/profile", profileRoute);
app.route("/permissions", permissionRoute);
app.route("/departments", departmentRoute);
app.route("/pinned-menus", pinnedMenusRoute);
app.route("/widgets", widgetRoute);

// INVENTORY USE CASE
app.route("/inventory", inventoryRoute);

app.get("/", (c) => c.text("Backend running"));
