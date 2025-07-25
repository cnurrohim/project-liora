import { useState } from "react";
import { layoutComponentRegistry } from "../../config/layoutComponentRegistry";
import { LayoutController } from "../../controller/layoutController";
import { IconRenderer } from "../../components/IconRenderer";

const layoutPositions = [
  "leftPane",
  "rightPane",
  "topPane",
  "bottomPane",
] as const;

type LayoutPosition = (typeof layoutPositions)[number];

type LayoutConfig = {
  [K in LayoutPosition]: string | null;
};

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

  const handleChange = (pos: LayoutPosition, componentId: string) => {
    if (componentId === "none") {
      LayoutController.setPane(pos, null);
      setConfig((prev) => ({ ...prev, [pos]: "none" }));
      return;
    }

    const def = layoutComponentRegistry.find((c) => c.id === componentId);

    // Update layout
    const content = def ? def.create(pos) : null;
    LayoutController.setPane(pos, content);

    // Update config form
    setConfig((prev) => {
      const newConfig = { ...prev, [pos]: componentId };

      // Jika singleton, kosongkan posisi lain yang pakai komponen yang sama
      if (def?.singleton) {
        for (const otherPos of Object.keys(prev) as LayoutPosition[]) {
          if (otherPos !== pos && prev[otherPos] === componentId) {
            newConfig[otherPos] = "none";
            LayoutController.setPane(otherPos, null);
          }
        }
      }

      return newConfig;
    });
  };

  return (
    <div className="p-6 space-y-6 text-white">
      <h2 className="text-xl font-semibold text-gray-200 flex flex-row gap-2">
        <IconRenderer name="RiLayoutLine" className="text-gray-200" size={30} />{" "}
        Layout Preferences
      </h2>
      {layoutPositions.map((pos) => (
        <div key={pos} className="space-y-2">
          <label className="text-sm text-gray-400 capitalize flex flex-row gap-2">
            {pos === "leftPane" && (
              <IconRenderer
                name="RiLayoutLeftLine"
                className="text-gray-400"
                size={20}
              />
            )}
            {pos === "rightPane" && (
              <IconRenderer
                name="RiLayoutRightLine"
                className="text-gray-400"
                size={20}
              />
            )}
            {pos === "topPane" && (
              <IconRenderer
                name="RiLayoutTopLine"
                className="text-gray-400"
                size={20}
              />
            )}
            {pos === "bottomPane" && (
              <IconRenderer
                name="RiLayoutBottomLine"
                className="text-gray-400"
                size={20}
              />
            )}
            {pos.replace("Pane", " Pane")}
          </label>
          <select
            className="w-full p-2 bg-gray-800 text-white rounded"
            value={config[pos] ?? ""}
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
      ))}
    </div>
  );
}
