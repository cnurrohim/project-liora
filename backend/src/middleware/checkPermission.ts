import type { MiddlewareHandler } from "hono";

// import { checkPermission } from "../middleware/checkPermission";

// adminRoute.get("/stats", checkPermission("view_stats"), (c) => {
//   return c.json({ message: "This is protected statistics data" });
// });

export function checkPermission(
  ...requiredPermissions: string[]
): MiddlewareHandler {
  return async (c, next) => {
    const user = c.get("user");

    if (!user || !Array.isArray(user.permissions)) {
      return c.json({ error: "Forbidden: No permissions found" }, 403);
    }

    const userPerms = new Set(user.permissions);
    const allowed = requiredPermissions.some((perm) => userPerms.has(perm));

    if (!allowed) {
      return c.json({ error: "Forbidden: Missing required permissions" }, 403);
    }

    await next();
  };
}

export function requireAllPermissions(...perms: string[]): MiddlewareHandler {
  return async (c, next) => {
    const user = c.get("user");
    if (!user || !Array.isArray(user.permissions)) {
      return c.json({ error: "No permissions" }, 403);
    }

    const userPerms = new Set(user.permissions);
    const hasAll = perms.every((perm) => userPerms.has(perm));

    if (!hasAll) {
      return c.json({ error: "Missing required permissions" }, 403);
    }

    await next();
  };
}
