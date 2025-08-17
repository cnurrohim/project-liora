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
      showErrorToast("Anda tidak punya hak akses untuk menghapus data ini!");
      return;
    }

    ConfirmationDialogController.askConfirmation(
      `Yakin ingin menghapus role "${name}"?`,
      async () => {
        await deleteRole(id);
        setRoles((prev) => prev.filter((r) => r.id !== id));
      }
    );
  };
  function openInNewTab(newTab: boolean = false) {
    if (!canCreate) {
      showErrorToast("Anda tidak punya hak akses untuk fitur ini!");
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
      showErrorToast("Anda tidak punya hak akses untuk fitur ini!");
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
      console.error("Gagal ambil data", err);
    }
  }

  return (
    <div className="p-4 text-white">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Daftar Role</h1>

        <ButtonGroupWithDropdown
          mainLabel={
            <>
              <IconRenderer
                name="RiShieldUserLine"
                size={15}
                className="text-white"
              />
              Tambah Role
            </>
          }
          onClick={() => openInNewTab(false)}
          dropdownItems={[
            {
              label: (
                <>
                  <IconRenderer
                    name="RiArrowRightUpBoxLine"
                    size={15}
                    className="text-white"
                  />
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
        <div>Tidak ada role</div>
      ) : (
        <table className="w-full border-collapse border border-gray-700">
          <thead className="bg-gray-800">
            <tr>
              <th className="p-2 border border-gray-700 text-left">Nama</th>
              <th className="p-2 border border-gray-700 text-left">
                Deskripsi
              </th>
              <th className="p-2 border border-gray-700 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr key={role.id} className="hover:bg-gray-800">
                <td className="p-2 border border-gray-700">{role.name}</td>
                <td className="p-2 border border-gray-700">
                  {role.description || "-"}
                </td>
                <td className="p-2 border border-gray-700 flex">
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
