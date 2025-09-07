import { useEffect, useState } from "react";
import { FormProvider, useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { layoutComponentRegistry } from "@/config/layoutComponentRegistry";
import {
  LayoutController,
  type LayoutConfig,
} from "@/controller/layoutController";
import { IconRenderer } from "@/components/IconRenderer";
import { saveLayout } from "./layout.api";
import { getActiveUser } from "@/services/authServices";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import ForbiddenPage from "pages/Misc/403";
import { usePermissions } from "./permissions";
import { RouteRegistry } from "@/config/routeRegistry";
import SingleSelect from "@/components/SelectOptions/SingleSelect";
import { layoutSchema, type LayoutFormValues } from "./formSchema";
import { UserPreferencesController } from "@/controller/UserPreferencesController";
import { TabController } from "@/components/Tab/controller";
import { useUserPreferences } from "@/hooks/useUserPreferences";

type LayoutPosition = "leftPane" | "rightPane" | "topPane" | "bottomPane";

type Option = {
  id: string;
  name: string;
};

export default function PreferencesForm() {
  const { canView, canSubmit } = usePermissions();
  if (!canView) return <ForbiddenPage />;

  const [allLauncher, setAllLauncher] = useState<Option[]>([]);
  const [allDefaultPage, setAllDefaultPage] = useState<Option[]>([]);

  const current = LayoutController.getState();
  const DefaultNewTab = UserPreferencesController.get("defaultNewTab");
  const DefaultPage = UserPreferencesController.get("defaultPage");
  const { theme, setTheme, themes } = useUserPreferences();

  const methods = useForm<LayoutFormValues>({
    resolver: zodResolver(layoutSchema),
    defaultValues: {
      leftPane: current.leftPaneKey ?? null,
      rightPane: current.rightPaneKey ?? null,
      topPane: current.topPaneKey ?? null,
      bottomPane: current.bottomPaneKey ?? null,
      defaultPage: DefaultPage ?? null,
      defaultNewTab: DefaultNewTab ?? null,
      theme: theme ?? "light",
    },
  });

  const { control, watch, handleSubmit, setValue } = methods;

  useEffect(() => {
    const update = () => {
      const s = LayoutController.getState();
      const DefaultNewTab = UserPreferencesController.get("defaultNewTab");
      const DefaultPage = UserPreferencesController.get("defaultPage");

      methods.reset({
        leftPane: s.leftPaneKey ?? null,
        rightPane: s.rightPaneKey ?? null,
        topPane: s.topPaneKey ?? null,
        bottomPane: s.bottomPaneKey ?? null,
        defaultPage: DefaultPage ?? null,
        defaultNewTab: DefaultNewTab ?? null,
        theme: theme ?? "light",
      });
    };

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

    const unsubUpdate = LayoutController.subscribe(update);
    return () => {
      unsubUpdate?.();
    };
  }, [methods]);

  const [isSaving, setIsSaving] = useState(false);

  const onSubmit = async (data: LayoutFormValues) => {
    setIsSaving(true);
    const user = getActiveUser();
    if (!user) {
      showErrorToast("User belum login!");
      return;
    }

    try {
      const layoutConfig: LayoutConfig = {
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

      await saveLayout(user.id, user.defaultRole.id, layoutConfig, config);

      setContentMargin();

      UserPreferencesController.load(user.id, user.defaultRole.id);
      if (config.default_page)
        TabController.setDefaultPage(config.default_page);

      showSuccessToast("Preferences saved");
    } catch (err) {
      console.error(err);
      showErrorToast("Failed to save preferences");
    } finally {
      setIsSaving(false);
    }
  };

  const setContentMargin = () => {
    const layout = LayoutController.getState();

    const layoutsPreferences = {
      hasTop: !!layout.topPane,
      hasBottom: !!layout.bottomPane,
      hasLeft: !!layout.leftPane,
      hasRight: !!layout.rightPane,
    };

    TabController.setContentMargin(layoutsPreferences);
  };

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
              const content = def?.create(pos) ?? null;
              LayoutController.updatePaneWithKey(pos, nextKey, content);

              if (def?.singleton && nextKey) {
                const positions: LayoutPosition[] = [
                  "topPane",
                  "bottomPane",
                  "leftPane",
                  "rightPane",
                ];
                for (const other of positions) {
                  if (other !== pos && watch(other) === nextKey) {
                    LayoutController.updatePaneWithKey(other, null, null);
                    setValue(other, null);
                  }
                }
              }

              setContentMargin();
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
      <div className="pt-6 max-w-3/4 mx-auto px-6">
        <h1 className="text-2xl font-bold text-[var(--accent-primary)] flex flex-row gap-2">
          Preferences
        </h1>
        <p className="text-sm text-[var(--content-text-muted)] leading-relaxed mt-2">
          This page allows you to customize the application layout and default
          behavior according to your needs. Each{" "}
          <span className="font-medium">pane</span>
          (top, left, right, bottom) represents a distinct area of the screen
          where you can place predefined components such as navigation menus,
          tab bars, and dashboards. The layout is highly flexible: every
          component can be enabled, disabled, or repositioned to support
          different use cases and different roles. For example, in a
          <span className="font-medium"> kiosk environment</span>, certain panes
          or components may be intentionally hidden so that users only have
          access to a limited set of features, ensuring focus and security.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="p-6 max-w-3/4 mx-auto space-y-4 "
      >
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

        <h2 className="text-xl font-semibold text-[var(--accent-primary)] flex flex-row gap-2 ">
          <IconRenderer
            name="RiAppsLine"
            className="text-[var(--accent-primary)]"
            size={30}
          />
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
                    setTheme(e.target.value as any); // ✅ apply langsung ke hook
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

        <div className="pt-4 ">
          {canSubmit && (
            <button
              type="submit"
              disabled={isSaving}
              className="w-28 flex justify-center text-[var(--success-foreground)] items-center px-4 py-2 bg-[var(--info)] rounded hover:bg-[var(--info-hover)] disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? "Saving..." : "Apply"}
            </button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
