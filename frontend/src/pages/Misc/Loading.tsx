import { useEffect, useState } from "react";
import { getAppSetting } from "../AppSettings/appSetting.api";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function Loading() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    getAppSetting().then((data) => {
      if (data.app_logo) {
        setPreviewUrl(`${API_URL}/uploads/app/${data.app_logo}`);
      }
    });
  }, []);
  return (
    <div className="relative w-full h-full">
      <div className="login-bg absolute inset-0 w-full h-full" />
      <div className="flex flex-col items-center gap-3 h-full justify-center">
        {previewUrl && (
          <img
            src={previewUrl}
            alt="Logo"
            className="h-100 object-contain animate-pulse opacity-80"
          />
        )}

        <span className="text-md opacity-70 text-white animate-pulse">
          Loading ...
        </span>
      </div>
    </div>
  );
}
