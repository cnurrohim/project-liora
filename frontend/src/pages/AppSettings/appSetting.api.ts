import { apiFetch } from "@/utils/apiFetch";

export async function getAppSetting() {
  const res = await apiFetch("/app-setting");
  if (!res.ok) throw new Error("Failed to fetch app setting");
  return await res.json();
}

export async function updateAppSetting(data: {
  app_name: string;
  app_logo?: File;
}) {
  const form = new FormData();
  form.append("app_name", data.app_name);
  if (data.app_logo) form.append("app_logo", data.app_logo);

  const res = await apiFetch("/app-setting", {
    method: "PUT",
    body: form,
  });
  if (!res.ok) throw new Error("Failed to save app setting");

  return await res.json();
}
