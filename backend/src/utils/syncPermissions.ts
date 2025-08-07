import { permissionRegistry } from "../config/permissionRegistry.js";
import { db } from "../db.js";

export async function syncPermissions() {
  for (const perm of permissionRegistry) {
    try {
      console.log("attempting to sync", perm);
      await db.query(
        `
        INSERT INTO permissions (name, label, domain, description)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (domain,name) DO UPDATE SET description = EXCLUDED.description
      `,
        [perm.name, perm.label, perm.domain, perm.description]
      );
    } catch (error) {
      console.log(error);
    }
  }
}
