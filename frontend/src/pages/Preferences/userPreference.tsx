import { useEffect, useState } from "react";
import { FormProvider, useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconRenderer } from "@/components/IconRenderer";
import { getUserPreferences, saveLayout } from "./layout.api";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import ForbiddenPage from "pages/Misc/403";
import { usePermissions } from "./permissions";
import { RouteRegistry } from "@/config/routeRegistry";
import SingleSelect from "@/components/SelectOptions/SingleSelect";
import { layoutSchema, type LayoutFormValues } from "./formSchema";
import { getUserById } from "../User/user.api";
import { useRouteParamsFromTab } from "@/hooks/useRouteParams";
import { layoutComponentRegistry } from "@/config/layoutComponentRegistry";
import { BackToListLink } from "@/components/Buttons/BackToListLink";
import { useUserPreferences } from "@/hooks/useUserPreferences";

type LayoutPosition = "leftPane" | "rightPane" | "topPane" | "bottomPane";
type Option = { id: string; name: string };

export default function UserPreferenceForm() {
  const { canView, canSubmit } = usePermissions();
  if (!canView) return <ForbiddenPage />;

  const { id } = useRouteParamsFromTab("/user/:id/preference");
  if (!id) return <ForbiddenPage />;

  const [allLauncher, setAllLauncher] = useState<Option[]>([]);
  const [allDefaultPage, setAllDefaultPage] = useState<Option[]>([]);

  const [allRoles, setAllRoles] = useState<Option[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const { themes } = useUserPreferences();

  const methods = useForm<LayoutFormValues>({
    resolver: zodResolver(layoutSchema),
    defaultValues: {
      leftPane: null,
      rightPane: null,
      topPane: null,
      bottomPane: null,
      defaultPage: null,
      defaultNewTab: null,
      theme: "light",
    },
  });

  const { control, watch, handleSubmit, setValue } = methods;

  useEffect(() => {
    const load = async () => {
      if (id) {
        const userDetail = await getUserById(id);
        if (userDetail) {
          setAllRoles(
            userDetail.roles.map((r: any) => ({ id: r.id, name: r.name }))
          );
          if (userDetail.roles.length > 0) {
            const defaultRole =
              userDetail.roles.find((r: any) => r.is_default) ??
              userDetail.roles[0];
            setSelectedRoleId(defaultRole.id);
          } else {
            setAllRoles([]);
            setSelectedRoleId(null);
          }
        }
      }
    };
    load();
  }, []);

  // fetch layout berdasarkan user/role terpilih
  useEffect(() => {
    if (!selectedRoleId) return;

    const fetchLayout = async () => {
      const preferences = await getUserPreferences(id, selectedRoleId);

      methods.reset({
        leftPane: preferences?.layout?.leftPane ?? null,
        rightPane: preferences?.layout?.rightPane ?? null,
        topPane: preferences?.layout?.topPane ?? null,
        bottomPane: preferences?.layout?.bottomPane ?? null,
        defaultPage: preferences?.default_page ?? null,
        defaultNewTab: preferences?.default_new_tab ?? null,
        theme: preferences?.theme ?? "light",
      });
    };
    fetchLayout();
  }, [selectedRoleId, methods]);

  // init dropdown options
  useEffect(() => {
    const availableLauncher = RouteRegistry.getAllOptions("launcher");
    setAllLauncher(
      availableLauncher.map((p: any) => ({ id: p.value, name: p.label }))
    );

    const availableRoute = RouteRegistry.getAllOptions("page");
    const availableDefault = RouteRegistry.getAllOptions("default");
    setAllDefaultPage(
      [...availableRoute, ...availableDefault].map((p: any) => ({
        id: p.value,
        name: p.label,
      }))
    );
  }, []);

  const [isSaving, setIsSaving] = useState(false);

  const onSubmit = async (data: LayoutFormValues) => {
    if (!id || !selectedRoleId) {
      showErrorToast("User dan role harus dipilih!");
      return;
    }

    setIsSaving(true);
    try {
      const layoutConfig = {
        leftPane: data.leftPane,
        rightPane: data.rightPane,
        topPane: data.topPane,
        bottomPane: data.bottomPane,
      };

      const config = {
        default_page: data.defaultPage,
        default_new_tab: data.defaultNewTab,
        theme: data.theme,
      };

      await saveLayout(id, selectedRoleId, layoutConfig, config);

      showSuccessToast("Preferences saved");
    } catch (err) {
      console.error(err);
      showErrorToast("Failed to save preferences");
    } finally {
      setIsSaving(false);
    }
  };

  const renderRoleSelect = () => (
    <div className="flex flex-row items-center">
      <label className="text-[var(--content-text-muted)] flex flex-row gap-2 w-58">
        <IconRenderer
          name="RiShieldUserLine"
          className="text-[var(--content-text)]"
          size={20}
        />
        Role
      </label>
      <select
        className="w-full p-2 bg-[var(--content-surface-hover)] text-[var(--content-text)] rounded"
        value={selectedRoleId ?? ""}
        onChange={(e) => setSelectedRoleId(e.target.value || null)}
      >
        {allRoles.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.name}
          </option>
        ))}
      </select>
    </div>
  );

  const renderSelect = (
    pos: LayoutPosition,
    iconName: string,
    label: string
  ) => (
    <div className="space-y-2 w-full ">
      <label className="text-sm text-[var(--content-text-muted)] capitalize flex flex-row gap-2">
        <IconRenderer
          name={iconName}
          className="text-[var(--content-text)]"
          size={20}
        />
        {label}
      </label>
      <Controller
        name={pos}
        control={control}
        render={({ field }) => (
          <select
            className="w-full p-2 bg-[var(--content-surface-hover)] text-[var(--content-text)] rounded"
            value={field.value ?? "none"}
            onChange={(e) => {
              const nextKey = e.target.value === "none" ? null : e.target.value;
              field.onChange(nextKey);

              const def = layoutComponentRegistry.find((c) => c.id === nextKey);

              if (def?.singleton && def.group && nextKey) {
                const positions: LayoutPosition[] = [
                  "topPane",
                  "bottomPane",
                  "leftPane",
                  "rightPane",
                ];

                for (const other of positions) {
                  if (other !== pos) {
                    const currentId = watch(other);
                    const currentDef = layoutComponentRegistry.find(
                      (c) => c.id === currentId
                    );
                    if (currentDef?.group === def.group) {
                      setValue(other, null);
                    }
                  }
                }
              }
            }}
          >
            <option value="none">-- None --</option>
            {layoutComponentRegistry
              .filter((c) => c.allowedPositions.includes(pos))
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
          </select>
        )}
      />
    </div>
  );

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="p-6 max-w-3/4 mx-auto space-y-4"
      >
        <BackToListLink route="/pages/users" label="list users" />
        <div className="flex flex-col gap-5 mb-10">{renderRoleSelect()}</div>

        {/* Layout */}
        <h2 className="text-xl font-semibold text-[var(--accent-primary)] flex flex-row gap-2">
          <IconRenderer
            name="RiLayoutLine"
            className="text-[var(--accent-primary)]"
            size={30}
          />
          Layout
        </h2>

        <div className="ml-10 flex flex-col gap-5 mb-15">
          {renderSelect("topPane", "RiLayoutTopLine", "Top Pane")}
          <div className="flex flex-row w-full gap-5 ">
            {renderSelect("leftPane", "RiLayoutLeftLine", "Left Pane")}
            {renderSelect("rightPane", "RiLayoutRightLine", "Right Pane")}
          </div>
          {renderSelect("bottomPane", "RiLayoutBottomLine", "Bottom Pane")}
        </div>

        {/* Others */}
        <h2 className="text-xl font-semibold text-[var(--accent-primary)] flex flex-row gap-2">
          <IconRenderer name="RiAppsLine" size={30} />
          Others
        </h2>
        <div className="ml-10 flex flex-col gap-5 mb-20">
          <div className="flex flex-row items-center">
            <label className="text-[var(--content-text-muted)] flex flex-row gap-2 w-58">
              <IconRenderer
                name="RiPagesLine"
                className="text-[var(--content-text)]"
                size={20}
              />
              Default New Tab
            </label>
            <Controller
              name="defaultNewTab"
              control={control}
              render={({ field }) => (
                <select
                  className="w-full p-2 bg-[var(--content-surface-hover)] text-[var(--content-text)] rounded"
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value || null)}
                >
                  <option value="">-- pilih route --</option>
                  {allLauncher.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name}
                    </option>
                  ))}
                </select>
              )}
            />
          </div>

          <div className="flex flex-row items-center">
            <label className="text-[var(--content-text-muted)] flex flex-row gap-2 w-58">
              <IconRenderer
                name="RiPagesLine"
                className="text-[var(--content-text)]"
                size={20}
              />
              Dashboard
            </label>
            <Controller
              name="defaultPage"
              control={control}
              render={({ field }) => (
                <SingleSelect
                  options={allDefaultPage}
                  value={
                    allDefaultPage.find((opt) => opt.id === field.value) ?? null
                  }
                  onChange={(val) => field.onChange(val ? val.id : null)}
                  placeholder="Choose default page for dashboard"
                />
              )}
            />
          </div>

          <div className="flex flex-row items-center">
            <label className="text-[var(--content-text-muted)] flex flex-row gap-2 w-58">
              <IconRenderer
                name="RiPagesLine"
                className="text-[var(--content-text)]"
                size={20}
              />
              Theme
            </label>
            <Controller
              name="theme"
              control={control}
              render={({ field }) => (
                <select
                  value={field.value ?? ""}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                  }}
                  className="w-full p-2 bg-[var(--content-surface-hover)] text-[var(--content-text)] rounded"
                >
                  {themes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              )}
            />
          </div>
        </div>

        {canSubmit && (
          <button
            type="submit"
            disabled={isSaving}
            className="w-28 flex justify-center text-[var(--success-foreground)] items-center px-4 py-2 bg-[var(--info)] rounded hover:bg-[var(--info-hover)] disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? "Saving..." : "Apply"}
          </button>
        )}
      </form>
    </FormProvider>
  );
}
