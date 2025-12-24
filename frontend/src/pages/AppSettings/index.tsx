import { useState, useEffect } from "react";
import { getAppSetting, updateAppSetting } from "./appSetting.api";
import { showSuccessToast } from "@/utils/toast";
import { AppConfigController } from "@/components/AppConfig/controller";
import { applyAppMetadata } from "@/config/appInit";
import ForbiddenPage from "pages/Misc/403";
import { useDepartmentPermissions } from "./permissions";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function AppSettingPage() {
  const { canView, canSubmit } = useDepartmentPermissions();

  if (!canView) return <ForbiddenPage />;

  const [appName, setAppName] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getAppSetting().then((data) => {
      setAppName(data.app_name ?? "");
      if (data.app_logo) {
        setPreviewUrl(`${API_URL}/uploads/app/${data.app_logo}`);
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    const result = await updateAppSetting({
      app_name: appName,
      app_logo: logoFile ?? undefined,
    });
    setLoading(false);
    if (result.success) {
      showSuccessToast("App setting saved");
      AppConfigController.loadConfig();
      applyAppMetadata(result.name, result.filename);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 max-w-3/4 space-y-6 mx-auto">
      <div>
        <label className="block text-sm font-medium  mb-1">
          Application Name
        </label>
        <input
          type="text"
          value={appName}
          onChange={(e) => setAppName(e.target.value)}
          placeholder="Eg: Aterna Somnia"
          className="w-full bg-(--content-surface) rounded-md shadow-sm  p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium  mb-1">Logo</label>
        <div className="flex items-center gap-4">
          <input
            type="file"
            accept=".png,.svg"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              setLogoFile(file);
              if (file) setPreviewUrl(URL.createObjectURL(file));
            }}
            className="block w-full text-sm text-(--content-text)
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-(--content-surface) file:text-(--content-text)
                  hover:file:bg-(--content-surface-hover)
                  cursor-pointer"
          />
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Logo Preview"
              className="h-20 w-20 object-contain "
            />
          )}
        </div>
      </div>

      {canSubmit && (
        <button
          type="submit"
          disabled={loading}
          className="w-28 flex justify-center text-(--success-foreground) items-center px-4 py-2 bg-(--info) rounded hover:bg-(--info-hover) disabled:opacity-50 cursor-pointer"
        >
          {loading ? "Saving..." : "Save"}
        </button>
      )}
    </form>
  );
}
