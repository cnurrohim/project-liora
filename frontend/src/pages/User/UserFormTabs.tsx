import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/TabbedForm/tabs";
import { useRouteParamsFromTab } from "@/hooks/useRouteParams";
import UserFormPage from "./form";
import UserPermissionOverrideForm from "./UserPermissionOverrideForm";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { schema } from "./formSchema"; // kita ekstrak schema dari form.tsx
import { z } from "zod";
import {
  createUser,
  getDepartments,
  getRoles,
  getUserById,
  updateUser,
} from "./user.api";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { useEffect, useState } from "react";
import UserRolesForm from "./userRolesForm";
import { IconRenderer } from "@/components/IconRenderer";
import { usePermissions } from "./permissions";
import ForbiddenPage from "pages/Misc/403";
import { ProfileController } from "@/controller/ProfileController";
import { BackToListLink } from "@/components/Buttons/BackToListLink";

type FormValues = z.infer<typeof schema>;

export type Option = { id: string; name: string };

export default function UserFormTabs() {
  const { canView, canUpdate, canCreate } = usePermissions();

  if (!canView) return <ForbiddenPage />;

  const { id } = useRouteParamsFromTab("/user/:id/edit");
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);

  const [overrides, setOverrides]: [
    Record<string, boolean>,
    React.Dispatch<React.SetStateAction<Record<string, boolean>>>
  ] = useState({});

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      is_active: true,
      roles: [],
      defaultRole: "",
      departments: [],
    },
  });

  const [roles, setRoles] = useState<Option[]>([]);
  const [departments, setDepartments] = useState<Option[]>([]);

  useEffect(() => {
    const load = async () => {
      const roleRes = await getRoles();
      const deptRes = await getDepartments();

      setRoles(roleRes.map((r: any) => ({ id: r.id, name: r.name })));
      setDepartments(deptRes.map((d: any) => ({ id: d.id, name: d.name })));
    };
    load();
  }, []);

  const {
    handleSubmit,
    reset,
    formState: { errors },
  } = methods;

  useEffect(() => {
    if (isEdit && id) {
      getUserById(id).then((user) => {
        reset({
          name: user.name,
          username: user.username,
          email: user.email,
          is_active: user.is_active,
          roles: user.roles,
          defaultRole: user.default_role_id,
          departments: user.departments,
        });
      });
    }
  }, [isEdit, id, reset]);

  const onSubmit = async (data: FormValues) => {
    if (isEdit && !canUpdate) {
      showErrorToast("We're sorry, you don't have access for this feature!");
      return;
    }

    if (!isEdit && !canCreate) {
      showErrorToast("We're sorry, you don't have access for this feature!");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: data.name,
        username: data.username,
        email: data.email,
        password: data.password || "changeme123",
        is_active: data.is_active,
        roleIds: data.roles.map((r) => r.id),
        defaultRoleId: data.defaultRole,
        departmentIds: data.departments.map((d) => d.id),
        userPermissions: overrides,
      };

      if (isEdit) {
        await updateUser(id!, payload);
        await ProfileController.load();
        showSuccessToast("User Updated");
      } else {
        await createUser(payload);
        showSuccessToast("User Created");
      }
    } catch (err: any) {
      showErrorToast(err.message || "Failed to create new user");
    } finally {
      setLoading(false);
    }
  };

  const isDataUserErrorsExists =
    !!errors.name ||
    !!errors.username ||
    !!errors.email ||
    !!errors.departments;

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 w-full max-w-4xl mx-auto p-4"
      >
        <BackToListLink route="/pages/users" label="list users" />
        <Tabs defaultValue="user">
          <TabsList>
            <TabsTrigger value="user">
              Data User
              {isDataUserErrorsExists && (
                <IconRenderer
                  name="RiErrorWarningFill"
                  size={20}
                  color="#fae332"
                />
              )}
            </TabsTrigger>
            <TabsTrigger value="roles">
              Manage User Roles
              {typeof errors.defaultRole?.message === "string" && (
                <IconRenderer
                  name="RiErrorWarningFill"
                  size={20}
                  color="#fae332"
                />
              )}
            </TabsTrigger>
            <TabsTrigger value="override">Override Permissions</TabsTrigger>
          </TabsList>

          <TabsContent value="user">
            <UserFormPage
              isEdit={isEdit}
              userId={id}
              departments={departments}
            />
          </TabsContent>

          <TabsContent value="roles">
            <UserRolesForm isEdit={isEdit} userId={id} roles={roles} />
          </TabsContent>

          <TabsContent value="override">
            <UserPermissionOverrideForm
              userId={id}
              selectedRoleIds={methods.watch("roles").map((r) => r.id)}
              overrides={overrides}
              setOverrides={setOverrides}
            />
          </TabsContent>

          <div className="pt-4">
            {canCreate && (
              <button
                type="submit"
                disabled={loading}
                className="w-28 flex justify-center text-(--info-foreground) items-center px-4 py-2 bg-(--info) rounded hover:bg-(--info-hover) disabled:opacity-50 cursor-pointer "
              >
                {loading ? "Saving..." : "Save"}
              </button>
            )}
          </div>
        </Tabs>
      </form>
    </FormProvider>
  );
}
