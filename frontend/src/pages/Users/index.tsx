import { useEffect, useState } from "react";
import { getUsers, deleteUser } from "./user.api";
import { PermissionController } from "../../controller/permissionController";
import { ConfirmationDialogController } from "../../components/ConfirmationDialog/controller";

import { ButtonGroupWithDropdown } from "../../components/Buttons/ButtonGroupWithDropdown";
import { openTabSmart } from "../../utils/handleMenuClick/openTabSmart";
import { IconRenderer } from "../../components/IconRenderer";

export default function UserListPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // const canView = PermissionController.hasPermission("users.view");
  // const canDelete = PermissionController.hasPermission("users.delete");

  const canView = true;
  const canDelete = true;

  useEffect(() => {
    if (canView) {
      getUsers()
        .then((res) => setUsers(res.users))
        .finally(() => setLoading(false));
    }
  }, []);

  if (!canView) return <div>Akses ditolak.</div>;
  if (loading) return <div>Loading...</div>;

  function openInNewTab(newTab: boolean = false) {
    openTabSmart(
      {
        route: "/users/create",
        label: "Tambah User",
        type: "route",
      },
      { replace: !newTab, remember: true }
    );
  }

  return (
    <div className="p-4 text-white">
      <h1 className="text-2xl font-bold mb-4">Daftar User</h1>
      <ButtonGroupWithDropdown
        mainLabel={
          <>
            <IconRenderer
              name="RiUserAddLine"
              size={15}
              className="text-white"
            />
            Tambah Users
          </>
        }
        onMainClick={() => openInNewTab(false)}
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

      <table className="w-full border-collapse border border-gray-700">
        <thead className="bg-gray-800">
          <tr>
            <th className="p-2 border border-gray-700 text-left">Nama</th>
            <th className="p-2 border border-gray-700 text-left">Username</th>
            <th className="p-2 border border-gray-700 text-left">Email</th>
            <th className="p-2 border border-gray-700 text-left">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="hover:bg-gray-800">
              <td className="p-2 border border-gray-700">{u.name}</td>
              <td className="p-2 border border-gray-700">{u.username}</td>
              <td className="p-2 border border-gray-700">{u.email}</td>
              <td className="p-2 border border-gray-700 flex">
                {/* Nanti tambahkan edit */}
                {canDelete && (
                  <button
                    onClick={() => {
                      ConfirmationDialogController.askConfirmation(
                        `Yakin hapus user ${u.name}?`,
                        async () => {
                          await deleteUser(u.id);
                          setUsers(users.filter((x) => x.id !== u.id));
                        }
                      );
                    }}
                    className="text-red-400 hover:text-red-600 flex items-center gap-1 cursor-pointer"
                  >
                    <IconRenderer
                      name="RiDeleteBin2Fill"
                      size={15}
                      className="text-white"
                    />{" "}
                    Hapus
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
