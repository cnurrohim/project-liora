// src/app.ts
import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { authRoute } from "./routes/auth.js";
import { userRoute } from "./routes/users.js";
import { roleRoute } from "./routes/role.js";
import { permissionRoute } from "./routes/permissions.js";
import type { Variables } from "./types/context.js";
import { menuRoute } from "./routes/menu.js";
import { userLayoutRoute } from "./routes/userLayoutRoute.js";
import { appSettingsRoute } from "./routes/appSettings.js";
import { serveStatic } from "@hono/node-server/serve-static";
import { departmentRoute } from "./routes/departments.js";
import { pinnedMenusRoute } from "./routes/pinnedMenus.js";
import { profileRoute } from "./routes/profile.js";

export const app = new Hono<{ Variables: Variables }>();

app.use("/uploads/*", serveStatic({ root: "./public" }));

app.use("*", logger());
app.use(
  cors({
    origin: "http://localhost:5173",
    allowHeaders: ["Authorization", "Content-Type"],
    credentials: true,
  })
);

app.route("/app-setting", appSettingsRoute);
app.route("/auth", authRoute);
app.route("/users", userRoute);
app.route("/menu", menuRoute);
app.route("/user-layout", userLayoutRoute);

app.route("/roles", roleRoute);
app.route("/profile", profileRoute);
app.route("/permissions", permissionRoute);
app.route("/departments", departmentRoute);
app.route("/pinned-menus", pinnedMenusRoute);

app.get("/", (c) => c.text("Backend running"));
