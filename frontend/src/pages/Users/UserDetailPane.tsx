import { Controller } from "../../components/DetailPane/Controller";
import { DetailPane } from "../../components/DetailPane/DetailPane";

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
          <p className="text-sm text-gray-400">Email</p>
          <p className="text-white">{user.email}</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Username</p>
          <p className="text-white">{user.username}</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Status</p>
          <p className="text-white">{user.is_active ? "Aktif" : "Nonaktif"}</p>
        </div>

        {/* Roles */}
        {roles.length > 0 && (
          <div>
            <p className="text-sm text-gray-400">Roles</p>
            <ul className="list-disc pl-5 text-white">
              {roles.map((r) => (
                <li key={r.id}>
                  {r.name}
                  {r.is_default && (
                    <span className="ml-2 text-xs text-yellow-400 bg-yellow-900 px-2 py-0.5 rounded">
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
            <p className="text-sm text-gray-400">Departments</p>
            <ul className="list-disc pl-5 text-white">
              {departments.map((d) => (
                <li key={d.id}>{d.name}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Permissions */}
        <div>
          <p className="text-sm text-gray-400 mb-2">Permissions</p>
          <div className="space-y-2">
            {Object.entries(permissions).map(([domain, perms]) => (
              <details key={domain} className="bg-gray-800 rounded">
                <summary className="cursor-pointer px-4 py-2 font-semibold">
                  {domain}
                  <span className="ml-2 text-sm text-gray-400">
                    ({perms.length})
                  </span>
                </summary>
                <div className="p-4 text-sm space-y-2">
                  {perms.map((p) => (
                    <div
                      key={p.id}
                      className="border-b border-gray-700 pb-2 space-y-1"
                    >
                      <div className="font-semibold text-white">
                        {p.label}
                        {p.source === "user" && (
                          <span className="ml-2 text-xs text-yellow-400 bg-yellow-900 px-2 py-0.5 rounded">
                            {p.granted ? "granted" : "revoke"}
                          </span>
                        )}
                      </div>
                      <div className="text-gray-400 text-sm">
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
