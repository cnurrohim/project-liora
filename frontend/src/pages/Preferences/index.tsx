import { useState } from "react";
import { layoutComponentRegistry } from "../../config/layoutComponentRegistry";
import {
  LayoutController,
  type LayoutConfig,
} from "../../controller/layoutController";
import { IconRenderer } from "../../components/IconRenderer";
import { saveLayout } from "./layout.api"; // gunakan API yg sebelumnya kamu buat
import { getActiveUser } from "../../services/authServices";
import { showErrorToast, showSuccessToast } from "../../utils/toast";

type LayoutPosition = "leftPane" | "rightPane" | "topPane" | "bottomPane";

export default function PreferencesForm() {
  const [config, setConfig] = useState<LayoutConfig>(() => {
    const current = LayoutController.getState();
    return {
      leftPane: current.leftPaneKey ?? null,
      rightPane: current.rightPaneKey ?? null,
      topPane: current.topPaneKey ?? null,
      bottomPane: current.bottomPaneKey ?? null,
    };
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (pos: LayoutPosition, componentId: string) => {
    const nextKey = componentId === "none" ? null : componentId;
    const def = layoutComponentRegistry.find((c) => c.id === componentId);
    const content = def?.create(pos) ?? null;

    LayoutController.updatePaneWithKey(pos, nextKey, content);

    const newConfig = { ...config, [pos]: nextKey ?? null };

    if (def?.singleton && nextKey) {
      const layoutPositions: LayoutPosition[] = [
        "topPane",
        "bottomPane",
        "leftPane",
        "rightPane",
      ];

      for (const otherPos of layoutPositions) {
        if (otherPos !== pos && config[otherPos] === nextKey) {
          LayoutController.updatePaneWithKey(otherPos, null, null);
          newConfig[otherPos] = null;
        }
      }
    }

    setConfig(newConfig);
  };

  const handleApply = async () => {
    setIsSaving(true);

    const user = getActiveUser();
    if (!user) {
      showErrorToast("User belum login!");
      return;
    }

    try {
      // simpan ke database via API
      await saveLayout(user.id, user.defaultRole.id, config);

      // simpan juga ke localStorage (opsional)
      localStorage.setItem("user_layout", JSON.stringify(config));

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
    <div className="space-y-2  w-full">
      <label className="text-sm text-gray-400 capitalize flex flex-row gap-2">
        <IconRenderer name={iconName} className="text-gray-400" size={20} />
        {label}
      </label>
      <select
        className="w-full p-2 bg-gray-800 text-white rounded"
        value={config[pos] ?? "none"}
        onChange={(e) => handleChange(pos, e.target.value)}
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
    </div>
  );

  return (
    <div className="p-6 space-y-6 text-white">
      <h2 className="text-xl font-semibold text-gray-200 flex flex-row gap-2">
        <IconRenderer name="RiLayoutLine" className="text-gray-200" size={30} />
        Layout Preferences
      </h2>

      {renderSelect("topPane", "RiLayoutTopLine", "Top Pane")}
      <div className="flex flex-row w-full gap-5 ">
        {renderSelect("leftPane", "RiLayoutLeftLine", "Left Pane")}
        <div></div>
        {renderSelect("rightPane", "RiLayoutRightLine", "Right Pane")}
      </div>
      {renderSelect("bottomPane", "RiLayoutBottomLine", "Bottom Pane")}

      <div className="pt-4">
        <button
          onClick={handleApply}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={isSaving}
        >
          {isSaving ? "Menyimpan..." : "Apply"}
        </button>
      </div>
    </div>
  );
}
