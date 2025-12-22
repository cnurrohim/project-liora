import { FormProvider, useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { menuSchema, type MenuFormValues } from "./formSchema";
import ForbiddenPage from "../Misc/403";
import { usePermissions } from "./permissions";
import { useRouteParamsFromTab } from "@/hooks/useRouteParams";
import { MENU } from "@/constants/menu";
import { useEffect, useState } from "react";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import {
  createMenu,
  getAllViewOnlyPermissions,
  getMenuById,
  getParentMenus,
  updateMenu,
} from "./menu.api";
import { MenuProviderController } from "@/controller/menuProviderController";
import { RouteRegistry } from "@/config/routeRegistry";
import { IconPicker } from "@/components/IconRenderer/IconPicker";
import SingleSelect from "@/components/SelectOptions/SingleSelect";
import { CommandRegistry } from "@/config/commandRegistry";
import MultiSelect from "@/components/SelectOptions/MultiSelect";
import { BackToListLink } from "@/components/Buttons/BackToListLink";

// const modeOptions = [MENU.MODE.SLIDING, MENU.MODE.SLIDING];
const alignmentOptions = [MENU.ALIGNMENT.START, MENU.ALIGNMENT.END];
const typeOptions = [MENU.TYPE.ROUTE, MENU.TYPE.COMMAND, MENU.TYPE.GROUP];

type Option = {
  id: string;
  name: string;
};

export default function MenuFormPage() {
  const { canCreate, canUpdate } = usePermissions();
  if (!canCreate && !canUpdate) return <ForbiddenPage />;

  const { id } = useRouteParamsFromTab("/menu/:id/edit");
  const isEdit = !!id;

  const methods = useForm<MenuFormValues>({
    resolver: zodResolver(menuSchema),
    defaultValues: {
      label: "",
      description: "",
      icon: "",
      icon_color: null,
      type: MENU.TYPE.ROUTE,
      route: null,
      command: "",
      parent_id: null,
      mode: MENU.MODE.SLIDING,
      alignment: MENU.ALIGNMENT.START,
      permissions: [],
    },
  });

  const {
    handleSubmit,
    reset,
    register,
    control,
    formState: { errors },
  } = methods;

  const [allMenus, setAllMenus] = useState<any[]>([]);
  const [allPermissions, setAllPermissions] = useState<Option[]>([]);
  const [allRoutes, setAllRoute] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: MenuFormValues) => {
    try {
      setLoading(true);
      if (isEdit) {
        if (!canUpdate)
          return showErrorToast("You don't have access to update!");
        await updateMenu(id!, data);
        showSuccessToast("Menu Updated");
      } else {
        if (!canCreate)
          return showErrorToast("You don't have access to create!");
        await createMenu(data);
        showSuccessToast("Menu Created");
      }
      MenuProviderController.load();
    } catch (err: any) {
      showErrorToast(err.message || "Failed to create new menu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const parentMenu = await getParentMenus();
      setAllMenus(parentMenu);

      const permissions = await getAllViewOnlyPermissions();
      setAllPermissions(
        permissions.map((p: any) => ({
          id: p.id,
          name: `${p.domain} ${p.name}`,
        }))
      );

      const availableRoutes = RouteRegistry.getAllOptions("page");
      setAllRoute(
        availableRoutes.map((p: any) => ({
          id: p.value,
          name: p.label,
        }))
      );

      if (isEdit && id) {
        const data = await getMenuById(id);
        reset({
          label: data.label ?? "",
          description: data.description ?? "",
          icon: data.icon ?? "",
          icon_color: data.icon_color ?? null,
          type: data.type ?? MENU.TYPE.ROUTE,
          route: data.route ?? null,
          command: data.command ?? "",
          parent_id: data.parent_id ?? null,
          mode: data.mode ?? MENU.MODE.SLIDING,
          alignment: data.alignment ?? MENU.ALIGNMENT.START,
          permissions:
            data.permissions?.map((p: any) => ({
              id: `${p.id}`,
              name: `${p.domain} ${p.name}`,
            })) ?? [],
        });
      }
    };
    init();
  }, [isEdit, id, reset]);

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="p-4 space-y-4 max-w-3/4 mx-auto"
      >
        <BackToListLink route="/pages/menu" label="list menus" />

        <h1 className="text-xl font-bold">
          {isEdit ? "Edit Menu" : "Add New Menu"}
        </h1>

        {/* Label */}
        <div>
          <label>Label</label>
          <input
            className="w-full p-2 bg-[var(--content-surface-hover)] rounded"
            {...register("label")}
          />
          {errors.label && (
            <p className="text-[var(--danger)] text-sm">
              {errors.label.message}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label>Description</label>
          <input
            className="w-full p-2 bg-[var(--content-surface-hover)] rounded"
            {...register("description")}
          />
        </div>

        {/* Icon */}
        <div>
          <label>Icon</label>
          <Controller
            name="icon"
            control={control}
            render={({ field }) => (
              <IconPicker
                selectedIcon={field.value}
                onSelect={(iconName) => field.onChange(iconName)}
              />
            )}
          />
          {errors.icon && (
            <p className="text-[var(--danger)] text-sm">
              {errors.icon.message}
            </p>
          )}
        </div>

        {/* Type */}
        <div>
          <label>Tipe</label>
          <select
            className="w-full p-2 bg-[var(--content-surface-hover)] rounded"
            {...register("type")}
          >
            {typeOptions.map((opt) => (
              <option key={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* Route (kalau type=route) */}
        {methods.watch("type") === "route" && (
          <div>
            <label>Route</label>
            <Controller
              name="route"
              control={control}
              render={({ field }) => (
                <SingleSelect
                  options={allRoutes}
                  value={
                    allRoutes.find((opt) => opt.id === field.value) ?? null
                  }
                  onChange={(val) => field.onChange(val ? val.id : null)}
                  placeholder="Choose Route"
                />
              )}
            />
          </div>
        )}

        {/* Command (kalau type=command) */}
        {methods.watch("type") === "command" && (
          <div>
            <label>Command</label>
            <select
              className="w-full p-2 bg-[var(--content-surface-hover)] rounded"
              {...register("command")}
            >
              <option value="">(choose command)</option>
              {CommandRegistry.getOptions().map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Parent */}
        <div>
          <label>Parent Menu (optional)</label>
          <select
            className="w-full p-2 bg-[var(--content-surface-hover)] rounded"
            {...register("parent_id")}
          >
            <option value="">(without parent)</option>
            {allMenus
              .filter((m) => m.id !== id)
              .map((menu) => (
                <option key={menu.id} value={menu.id}>
                  {menu.label}
                </option>
              ))}
          </select>
        </div>

        {/* Alignment */}
        <div>
          <label>Alignment</label>
          <select
            className="w-full p-2 bg-[var(--content-surface-hover)] rounded"
            {...register("alignment")}
          >
            {alignmentOptions.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </div>

        {/* Permissions */}
        <div>
          <label>Permissions</label>
          <Controller
            name="permissions"
            control={control}
            render={({ field }) => (
              <MultiSelect
                options={allPermissions}
                value={field.value || []}
                onChange={(val) => field.onChange(val)}
                placeholder="Pilih permission"
              />
            )}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-28 flex justify-center text-[var(--success-foreground)] items-center px-4 py-2 bg-[var(--info)] rounded hover:bg-[var(--info-hover)] disabled:opacity-50 cursor-pointer"
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </form>
    </FormProvider>
  );
}
