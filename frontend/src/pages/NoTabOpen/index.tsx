import { useEffect, useState } from "react";
import { IconRenderer } from "../../components/IconRenderer";
import { getAppSetting } from "../AppSettings/appSetting.api";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function NoTabOpen() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    getAppSetting().then((data) => {
      if (data.app_logo) {
        setPreviewUrl(`${API_URL}/uploads/${data.app_logo}`);
      }
    });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-500">
      <div className="text-[400px] mb-2 text-gray-900">
        {previewUrl && (
          <img
            src={previewUrl}
            alt="Logo Preview"
            className="h-30 object-contain"
          />
        )}

        {!previewUrl && (
          <IconRenderer
            name="RiGhostSmileLine"
            className="text-gray-900"
            size={300}
          />
        )}
      </div>
      <div className="text-center text-sm">No Tab Open</div>
    </div>
  );
}
