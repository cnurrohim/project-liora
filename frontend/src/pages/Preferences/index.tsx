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

  console.log(DefaultNewTab);
  console.log(DefaultPage);

  const methods = useForm<LayoutFormValues>({
    resolver: zodResolver(layoutSchema),
    defaultValues: {
      leftPane: current.leftPaneKey ?? null,
      rightPane: current.rightPaneKey ?? null,
      topPane: current.topPaneKey ?? null,
      bottomPane: current.bottomPaneKey ?? null,
      defaultPage: DefaultPage ?? null,
      defaultNewTab: DefaultNewTab ?? null,
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
      };

      await saveLayout(user.id, user.defaultRole.id, layoutConfig, config);
      localStorage.setItem("user_layout", JSON.stringify(layoutConfig));
      UserPreferencesController.load(user.id, user.defaultRole.id);
      if (config.default_page)
        TabController.setDefaultPage(config.default_page);

      showSuccessToast("Layout berhasil disimpan.");
    } catch (err) {
      console.error(err);
      showErrorToast("Gagal menyimpan layout.");
    } finally {
      setIsSaving(false);
    }
  };

  const renderSelect = (
    pos: LayoutPosition,
    iconName: string,
    label: string
  ) => (
    <div className="space-y-2 w-full">
      <label className="text-sm text-gray-400 capitalize flex flex-row gap-2">
        <IconRenderer name={iconName} className="text-gray-400" size={20} />
        {label}
      </label>
      <Controller
        name={pos}
        control={control}
        render={({ field }) => (
          <select
            className="w-full p-2 bg-gray-800 text-white rounded"
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
        className="p-6 space-y-6 text-white"
      >
        <h2 className="text-xl font-semibold text-gray-200 flex flex-row gap-2">
          <IconRenderer
            name="RiLayoutLine"
            className="text-gray-200"
            size={30}
          />
          Layout Preferences
        </h2>

        <div className="ml-10 flex flex-col gap-5 mb-20">
          {renderSelect("topPane", "RiLayoutTopLine", "Top Pane")}
          <div className="flex flex-row w-full gap-5 ">
            {renderSelect("leftPane", "RiLayoutLeftLine", "Left Pane")}
            {renderSelect("rightPane", "RiLayoutRightLine", "Right Pane")}
          </div>
          {renderSelect("bottomPane", "RiLayoutBottomLine", "Bottom Pane")}
        </div>

        <h2 className="text-xl font-semibold text-gray-200 flex flex-row gap-2 ">
          <IconRenderer name="RiAppsLine" className="text-gray-200" size={30} />
          Others
        </h2>

        <div className="ml-10 flex flex-col gap-5 mb-20">
          <div className="flex flex-row items-center">
            <label className="text-gray-400 flex flex-row gap-2 w-58">
              <IconRenderer
                name="RiPagesLine"
                className="text-gray-400"
                size={20}
              />
              Default New Tab :
            </label>
            <Controller
              name="defaultNewTab"
              control={control}
              render={({ field }) => (
                <select
                  className="w-full p-2 bg-gray-900 text-white rounded"
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
            <label className="text-gray-400 flex flex-row gap-2 w-58">
              <IconRenderer
                name="RiPagesLine"
                className="text-gray-400"
                size={20}
              />
              Dashboard :
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
        </div>

        <div className="pt-4">
          {canSubmit && (
            <button
              type="submit"
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {isSaving ? "Menyimpan..." : "Apply"}
            </button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
