import { Hono } from "hono";
import { authMiddleware } from "../../middleware/auth.js";
import { checkRole } from "../../middleware/checkRole.js";

const adminRoute = new Hono();

adminRoute.use(authMiddleware); // wajib login
adminRoute.use(checkRole("admin")); // wajib role "admin"

adminRoute.get("/", (c) => {
  return c.json({ message: "Welcome, admin!" });
});

export default adminRoute;
