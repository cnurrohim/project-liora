import type { MiddlewareHandler } from "hono";

export function checkRole(...allowedRoles: string[]): MiddlewareHandler {
  return async (c, next) => {
    const user = c.get("user");

    if (!user || !user.role) {
      return c.json({ error: "Forbidden: No role" }, 403);
    }

    if (!allowedRoles.includes(user.role)) {
      return c.json({ error: "Forbidden: Insufficient role" }, 403);
    }

    await next();
  };
}
