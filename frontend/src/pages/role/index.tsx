import { useEffect, useState } from "react";
import { deleteRole, getRoleDetail, getRoles } from "./role.api";
import { ConfirmationDialogController } from "@/components/ConfirmationDialog/controller";
import { openTabSmart } from "@/utils/handleMenuClick/openTabSmart";
import { ButtonGroupWithDropdown } from "@/components/Buttons/ButtonGroupWithDropdown";
import { IconRenderer } from "@/components/IconRenderer";
import { EditButtonLink } from "@/components/Buttons/EditButtonLink";
import { ViewButtonLink } from "@/components/Buttons/ViewButtonLink";
import { DeleteButtonLink } from "@/components/Buttons/DeleteButtonLink";

import { RoleDetailPane, RoleDetailPaneController } from "./RoleDetailPane";
import ForbiddenPage from "pages/Misc/403";
import { usePermissions } from "./permissions";
import { showErrorToast } from "@/utils/toast";

export default function RoleListPage() {
  const { canView, canDelete, canUpdate, canCreate } = usePermissions();

  if (!canView) return <ForbiddenPage />;

  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRoles()
      .then(setRoles)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = (id: string, name: string) => {
    if (!canDelete) {
      showErrorToast("We're sorry, you don't have access to delete this data!");
      return;
    }

    ConfirmationDialogController.askConfirmation(
      `You're about to delete this role: "${name}"?`,
      async () => {
        try {
          await deleteRole(id);
          setRoles((prev) => prev.filter((r) => r.id !== id));
        } catch (err: any) {
          showErrorToast(err.response?.data?.error || err.message);
        }
      }
    );
  };
  function openInNewTab(newTab: boolean = false) {
    if (!canCreate) {
      showErrorToast("We're sorry, you don't have access for this feature!");
      return;
    }

    openTabSmart(
      {
        id: "/roles/create",
        route: "/roles/create",
        label: "Tambah Role",
        type: "route",
      },
      { replace: !newTab, remember: true }
    );
  }

  function handleEditClick(roleId: string, name: string) {
    if (!canUpdate) {
      showErrorToast("We're sorry, you don't have access for this feature!");
      return;
    }

    openTabSmart(
      {
        id: `/roles/${roleId}/edit`,
        route: `/roles/${roleId}/edit`,
        label: `Edit: ${name}`,
        type: "route",
      },
      { replace: true }
    );
  }

  async function handleViewClick(roleId: string) {
    try {
      const detail = await getRoleDetail(roleId);
      RoleDetailPaneController.open(detail);
    } catch (err) {
      console.error("Failed to fetch data", err);
    }
  }

  return (
    <div className="p-4 text-[var(--primary)]">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Roles</h1>

        <ButtonGroupWithDropdown
          mainLabel={
            <>
              <IconRenderer name="RiShieldUserLine" size={15} />
              Add new role
            </>
          }
          onClick={() => openInNewTab(false)}
          dropdownItems={[
            {
              label: (
                <>
                  <IconRenderer name="RiArrowRightUpBoxLine" size={15} />
                  Open in new tab
                </>
              ),
              onClick: () => openInNewTab(true),
            },
          ]}
        />
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : roles.length === 0 ? (
        <div>There is no role</div>
      ) : (
        <table className="w-full border-collapse ">
          <thead className="bg-[var(--content-surface)]">
            <tr>
              <th className="p-2  text-left text-[var(--content-text-muted)]">
                Nama
              </th>
              <th className="p-2  text-left text-[var(--content-text-muted)]">
                Deskripsi
              </th>
              <th className="p-2  text-left text-[var(--content-text-muted)]">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr
                key={role.id}
                className="hover:bg-[var(--content-surface-hover)]"
              >
                <td className="p-2  ">{role.name}</td>
                <td className="p-2 ">{role.description || "-"}</td>
                <td className="p-2  flex">
                  {canUpdate && (
                    <EditButtonLink
                      onClick={() => handleEditClick(role.id, role.name)}
                    />
                  )}

                  <ViewButtonLink onClick={() => handleViewClick(role.id)} />

                  {canDelete && (
                    <DeleteButtonLink
                      onClick={() => handleDelete(role.id, role.name)}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <RoleDetailPane />
    </div>
  );
}
