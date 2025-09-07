import { Controller } from "@/components/DetailPane/Controller";
import { DetailPane } from "@/components/DetailPane/DetailPane";

export type Permission = {
  id: string;
  name: string;
  label: string;
  description: string;
  source: "role" | "user";
  granted?: boolean;
};

export type Role = {
  id: string;
  name: string;
  description: string;
  is_default: boolean;
};

export type Department = {
  id: string;
  name: string;
  description: string;
};

export type User = {
  id: string;
  name: string;
  username: string;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type UserDetailData = {
  user: User;
  roles: Role[];
  departments: Department[];
  permissions: Record<string, Permission[]>;
};

export const UserDetailPaneController = Controller<UserDetailData>();

export function UserDetailPane() {
  const state = UserDetailPaneController.useDetailPane();

  if (!state.visible || !state.data) return null;

  const { user, roles, departments, permissions } = state.data;

  return (
    <DetailPane
      visible={state.visible}
      title={user.name}
      onClose={UserDetailPaneController.close}
    >
      <section className="space-y-4 mb-52">
        {/* Info User */}
        <div>
          <p className="text-sm text-[var(--content-text-muted)]">Email</p>
          <p className="text-[var(--content-text)]">{user.email}</p>
        </div>
        <div>
          <p className="text-sm text-[var(--content-text-muted)]">Username</p>
          <p className="text-[var(--content-text)]">{user.username}</p>
        </div>
        <div>
          <p className="text-sm text-[var(--content-text-muted)]">Status</p>
          <p className="text-[var(--content-text)]">
            {user.is_active ? "Aktif" : "Nonaktif"}
          </p>
        </div>

        {/* Roles */}
        {roles.length > 0 && (
          <div>
            <p className="text-sm text-[var(--content-text-muted)]">Roles</p>
            <ul className="list-disc pl-5 text-[var(--content-text)]">
              {roles.map((r) => (
                <li key={r.id}>
                  {r.name}
                  {r.is_default && (
                    <span className="ml-2 text-xs text-[var(--content-text)] bg-[var(--content-surface)] px-2 py-0.5 rounded">
                      default
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Departments */}
        {departments.length > 0 && (
          <div>
            <p className="text-sm text-[var(--content-text-muted)]">
              Departments
            </p>
            <ul className="list-disc pl-5 text-[var(--content-text)]">
              {departments.map((d) => (
                <li key={d.id}>{d.name}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Permissions */}
        <div>
          <p className="text-sm text-[var(--content-text-muted)] mb-2">
            Permissions
          </p>
          <div className="space-y-2">
            {Object.entries(permissions).map(([domain, perms]) => (
              <details
                key={domain}
                className="bg-[var(--content-surface)] rounded"
              >
                <summary className="cursor-pointer px-4 py-2 font-semibold text-[var(--content-text)]">
                  {domain}
                  <span className="ml-2 text-sm text-[var(--content-text)]">
                    ({perms.length})
                  </span>
                </summary>
                <div className="p-4 text-sm space-y-2">
                  {perms.map((p) => (
                    <div
                      key={p.id}
                      className="border-b border-[var(--content-border)] pb-2 space-y-1"
                    >
                      <div className="font-semibold text-[var(--content-text)]">
                        {p.label}
                        {p.source === "user" && (
                          <span
                            className={`${
                              p.granted
                                ? "text-[var(--success-foreground)] bg-[var(--success)]"
                                : "text-[var(--danger-foreground)] bg-[var(--danger)]"
                            }
                          ml-2 text-xs  px-2 py-0.5 rounded`}
                          >
                            {p.granted ? "granted" : "revoke"}
                          </span>
                        )}
                      </div>
                      <div className="text-[var(--content-text)] text-sm">
                        {p.description}
                      </div>
                      <div className="text-gray-500 text-xs italic">
                        {p.name}
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </DetailPane>
  );
}
