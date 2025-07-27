import type { MiddlewareHandler } from "hono";
import jwt from "jsonwebtoken";
import type { Variables } from "../types/context.js";

export const authMiddleware: MiddlewareHandler<{
  Variables: Variables;
}> = async (c, next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const token = authHeader?.split(" ")[1];
  if (!token) return c.json({ error: "Invalid Authorization header" }, 401);

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as Variables["user"];

    if (!decoded.id || !decoded.role) {
      return c.json(
        {
          error: `Token payload missing required fields ${decoded.id} and ${decoded.role}`,
        },
        400
      );
    }

    c.set("user", decoded);
    await next();
  } catch (err) {
    return c.json({ error: "Invalid or expired token" }, 401);
  }
};
