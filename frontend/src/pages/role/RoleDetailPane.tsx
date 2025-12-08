import { Controller } from "@/components/DetailPane/Controller";
import { DetailPane } from "@/components/DetailPane/DetailPane";

export type Permission = {
  id: string;
  name: string;
  label: string;
  description: string;
};

export type RoleDetailData = {
  id: string;
  name: string;
  description: string;
  permissions: Record<string, Permission[]>;
};

export const RoleDetailPaneController = Controller<RoleDetailData>();

export function RoleDetailPane() {
  const state = RoleDetailPaneController.useDetailPane();

  if (!state.visible || !state.data) return null;

  const { name, description, permissions } = state.data;

  return (
    <DetailPane
      visible={state.visible}
      title={name}
      onClose={RoleDetailPaneController.close}
    >
      <div>
        <p className="text-sm text-[var(--content-text)]">Description</p>
        <p className="text-[var(--content-text)]">{description || "-"}</p>
      </div>

      {Object.entries(permissions).map(([domain, perms]) => (
        <details key={domain} className="bg-[var(--content-surface)] rounded">
          <summary className="cursor-pointer px-4 py-2 font-semibold">
            {domain}
            <span className="ml-2 text-sm text-[var(--content-text)]">
              ({perms.length})
            </span>
          </summary>
          <div className="p-4 text-sm space-y-2">
            {perms.map((p) => (
              <div
                key={p.id}
                className="border-b border-[var(--content-border)] pb-2"
              >
                <div className="font-semibold text-[var(--content-text)]">
                  {p.label}
                </div>
                <div className="text-[var(--content-text)] text-sm">
                  {p.description}
                </div>
                <div className="text-gray-500 text-xs italic">{p.name}</div>
              </div>
            ))}
          </div>
        </details>
      ))}
    </DetailPane>
  );
}
