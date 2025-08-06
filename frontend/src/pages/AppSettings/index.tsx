import { useState, useEffect } from "react";
import { getAppSetting, updateAppSetting } from "./appSetting.api";
import { showSuccessToast } from "../../utils/toast";
import { AppConfigController } from "../../components/AppConfig/controller";
import { applyAppMetadata } from "../../config/appInit";
import { useHasPermission } from "../../hooks/useHasPermission";
import ForbiddenPage from "../Misc/403";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function AppSettingPage() {
  const canAccessPage = useHasPermission(["dev.dev"]);
  const canSubmit = useHasPermission("dev.dev");

  if (!canAccessPage) return <ForbiddenPage />;

  const [appName, setAppName] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getAppSetting().then((data) => {
      setAppName(data.app_name ?? "");
      if (data.app_logo) {
        setPreviewUrl(`${API_URL}/uploads/${data.app_logo}`);
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
      showSuccessToast("Berhasil Simpan");
      AppConfigController.loadConfig();
      applyAppMetadata(result.name, result.filename);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <div>
        <label className="block text-sm font-medium  mb-1">Nama Aplikasi</label>
        <input
          type="text"
          value={appName}
          onChange={(e) => setAppName(e.target.value)}
          placeholder="Contoh: Aterna Somnia"
          className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
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
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-gray-700 file:text-gray-200
              hover:file:bg-gray-900
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
          className="w-full flex justify-center items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Menyimpan..." : "Simpan"}
        </button>
      )}
    </form>
  );
}
