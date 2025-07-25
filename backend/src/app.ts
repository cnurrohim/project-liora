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

export const app = new Hono<{ Variables: Variables }>();

app.use("*", logger());
app.use(
  cors({
    origin: "*", // atau domain frontend-mu
    allowHeaders: ["Authorization", "Content-Type"],
  })
);

app.route("/auth", authRoute);
app.route("/users", userRoute);
app.route("/menu", menuRoute);

app.route("/roles", roleRoute);
app.route("/permissions", permissionRoute);

app.get("/", (c) => c.text("Backend running"));
