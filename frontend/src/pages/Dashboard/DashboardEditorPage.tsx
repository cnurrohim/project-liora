import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  dashboardLayoutSchema,
  type DashboardLayoutFormValues,
} from "./formSchema";
import { usePermissions } from "./permissions";
import ForbiddenPage from "../Misc/403";
import { useEffect, useState } from "react";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { WidgetRegistry } from "@/config/WidgetRegistry";
import { WidgetRenderer } from "@/widgets/WidgetRenderer";
import { getActiveUser } from "@/services/authServices";
import { getDashboardLayout, saveDashboardLayout } from "./dashboard.api";
import { IconRenderer } from "@/components/IconRenderer";

export default function DashboardEditorPage({
  onSaved,
  onView,
}: {
  onSaved?: (layout: DashboardLayoutFormValues) => void;
  onView: () => void;
}) {
  const { canView, canSubmit } = usePermissions();
  if (!canView) return <ForbiddenPage />;

  const [user] = useState(() => getActiveUser());
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const methods = useForm<DashboardLayoutFormValues>({
    resolver: zodResolver(dashboardLayoutSchema),
    defaultValues: { rows: [] },
  });

  const { handleSubmit, watch, setValue } = methods;
  const rows = watch("rows");

  // === load layout saat pertama kali ===
  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        const layout = await getDashboardLayout(user.id, user.defaultRole.id);
        if (layout?.rows) {
          setValue("rows", layout.rows);
        }
      } catch (err) {
        console.error(err);
        showErrorToast("Failed to load dashboard layout");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [user, setValue]);

  const onSubmit = async (data: DashboardLayoutFormValues) => {
    setIsSaving(true);
    try {
      if (user) {
        await saveDashboardLayout(user.id, user.defaultRole.id, data);
        showSuccessToast("Dashboard saved");
        onSaved?.(data);
      }
    } catch (err) {
      console.error(err);
      showErrorToast("Failed to save dashboard");
    } finally {
      setIsSaving(false);
    }
  };

  // === helpers ===
  const addRow = () => {
    const newRow = { columns: [{ component: "", width: 12 }] };
    setValue("rows", [...rows, newRow]);
  };

  const addColumn = (rowIdx: number) => {
    const updatedRows = [...rows];
    updatedRows[rowIdx].columns.push({ component: "", width: 6 });
    setValue("rows", updatedRows);
  };

  const deleteColumn = (rowIdx: number, colIdx: number) => {
    const updatedRows = [...rows];
    updatedRows[rowIdx].columns.splice(colIdx, 1);
    if (updatedRows[rowIdx].columns.length === 0) {
      updatedRows.splice(rowIdx, 1);
    }
    setValue("rows", updatedRows);
  };

  const deleteRow = (rowIdx: number) => {
    const updatedRows = [...rows];
    updatedRows.splice(rowIdx, 1);
    setValue("rows", updatedRows);
  };

  const updateColumn = (
    rowIdx: number,
    colIdx: number,
    key: string,
    value: any
  ) => {
    const updatedRows = [...rows];
    (updatedRows[rowIdx].columns as any)[colIdx][key] = value;

    // ✅ kalau ganti widget, set default width dari registry
    if (key === "component") {
      const widget = WidgetRegistry.getByKey(value);
      if (widget?.defaultWidth) {
        updatedRows[rowIdx].columns[colIdx].width = widget.defaultWidth;
      }
    }

    setValue("rows", updatedRows);
  };

  const adjustWidth = (rowIdx: number, colIdx: number, delta: number) => {
    const updatedRows = [...rows];
    let newWidth = updatedRows[rowIdx].columns[colIdx].width + delta;
    if (newWidth < 1) newWidth = 1;
    if (newWidth > 12) newWidth = 12;
    updatedRows[rowIdx].columns[colIdx].width = newWidth;
    setValue("rows", updatedRows);
  };

  if (isLoading) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  const addRowButton = (
    <div className="flex justify-center border py-5 border-(--content-text-hover) border-dashed">
      <button
        type="button"
        onClick={addRow}
        className="w-15 h-15 p-0 rounded-full bg-(--content-surface-hover) text-(--content-text-muted) hover:bg-(--content-surface-highlight) cursor-pointer flex items-center justify-center"
      >
        <IconRenderer name="RiAddCircleFill" className="w-8 h-8" />
      </button>
    </div>
  );

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 mx-auto space-y-4">
        <div className="flex flex-row gap-2">
          <h1 className="text-2xl font-bold text-(--accent-primary)">
            Manage Dashboard
          </h1>

          <button
            onClick={onView}
            className="px-1 border border-(--content-border) rounded text-(--content-text-muted) hover:text-(--content-text) hover:bg-(--content-surface-hover) cursor-pointer"
          >
            <IconRenderer name="RiEyeLine" className="w-4 h-4" />
          </button>
        </div>

        {/* === editor === */}
        <div className="space-y-6">
          {rows.length === 0 && addRowButton}

          {rows.map((row, rowIdx) => (
            <div key={rowIdx} className="flex gap-4">
              {row.columns.map((col, colIdx) => (
                <div
                  key={colIdx}
                  className="rounded p-4 bg-(--content-surface-inset) relative"
                  style={{ flex: col.width }}
                >
                  {/* tombol delete kolom */}
                  <button
                    type="button"
                    onClick={() => deleteColumn(rowIdx, colIdx)}
                    className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full bg-(--content-surface-inset) text-red-300 hover:bg-(--danger-hover) hover:text-(--content-surface-inset) cursor-pointer"
                  >
                    ✖
                  </button>

                  {/* pilih widget */}
                  <select
                    value={col.component}
                    onChange={(e) =>
                      updateColumn(rowIdx, colIdx, "component", e.target.value)
                    }
                    className="w-full border rounded border-(--content-border) bg-(--content-surface-hover) px-2 py-1 mb-2 cursor-pointer"
                  >
                    <option value="">-- Select Widget --</option>
                    {WidgetRegistry.getAllOptions().map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>

                  {/* preview widget */}
                  {col.component && (
                    <div className="mt-2">
                      <WidgetRenderer
                        widgetKey={col.component}
                        width={col.width}
                      />
                    </div>
                  )}

                  {/* controls */}
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => adjustWidth(rowIdx, colIdx, -1)}
                      className="px-2 py-1 border border-(--content-border) rounded cursor-pointer text-(--content-text) hover:text-(--info-hover) "
                    >
                      <IconRenderer
                        name="RiArrowLeftWideFill"
                        className="w-4 h-4"
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => adjustWidth(rowIdx, colIdx, +1)}
                      className="px-2 py-1 border border-(--content-border) rounded cursor-pointer text-(--content-text) hover:text-(--info-hover) "
                    >
                      <IconRenderer
                        name="RiArrowRightWideFill"
                        className="w-4 h-4"
                      />
                    </button>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    Width: {col.width}/12
                  </p>
                </div>
              ))}

              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => addColumn(rowIdx)}
                  className="self-start h-8 w-8 flex items-center justify-center border rounded text-(--info) hover:text-(--info-hover) cursor-pointer"
                >
                  <IconRenderer name="RiAddLargeLine" className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => deleteRow(rowIdx)}
                  className="self-start h-8 w-8 flex items-center justify-center border rounded text-(--danger) hover:text-(--danger-hover)  cursor-pointer"
                >
                  <IconRenderer name="RiDeleteBin6Line" className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {/* tombol add row */}
          {rows.length > 0 && addRowButton}
        </div>

        {/* === submit === */}
        <div className="pt-4">
          {canSubmit && (
            <button
              type="submit"
              disabled={isSaving}
              className="w-38 flex justify-center items-center px-4 py-2 bg-(--info) text-(--success-foreground) rounded hover:bg-(--info-hover) disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? "Saving..." : "Set Dashboard"}
            </button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
