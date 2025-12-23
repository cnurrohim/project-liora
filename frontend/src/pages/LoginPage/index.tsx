import { useEffect, useState } from "react";

import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { login, loginDemo } from "./login.api";
import { useNavigate } from "react-router-dom";
import { IconRenderer } from "@/components/IconRenderer";
import { getAppSetting } from "../AppSettings/appSetting.api";

const API_URL = import.meta.env.VITE_API_BASE_URL;
const DEMO_MODE = import.meta.env.VITE_API_DEMO_MODE === "true";

export default function LoginPage() {
  useAuthRedirect();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    getAppSetting().then((data) => {
      if (data.app_logo) {
        setPreviewUrl(`${API_URL}/uploads/app/${data.app_logo}`);
      }
    });
  }, []);

  const applyAuthSession = (token: string, user: any) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    navigate("/", { replace: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!DEMO_MODE || loading) return;
    setError("");
    setLoading(true);
    try {
      const { token, user } = await login({ username, password });
      applyAuthSession(token, user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: "admin" | "staff" | "dev") => {
    if (!DEMO_MODE || loading) return;
    setError("");
    setLoading(true);
    try {
      const { token, user } = await loginDemo({ role });
      applyAuthSession(token, user);
    } catch {
      setError("Demo login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <form
        onSubmit={handleSubmit}
        className="p-6 rounded shadow-md w-80 space-y-4"
      >
        <div className="text-2xl mb-4 text-gray-900 text-center flex flex-col items-center justify-center">
          {previewUrl && (
            <img src={previewUrl} alt="Logo" className="h-100 object-contain" />
          )}

          {!previewUrl && (
            <IconRenderer
              name="RiBox2Line"
              className="text-gray-400"
              size={200}
            />
          )}
        </div>

        {error && <div className="text-red-400 text-sm">{error}</div>}

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white outline-none"
          required
        />

        <div className="relative w-full">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white outline-none pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white cursor-pointer"
            tabIndex={-1}
          >
            {showPassword ? (
              <IconRenderer
                name="RiEyeCloseLine"
                size={20}
                className="text-white"
              />
            ) : (
              <IconRenderer name="RiEyeFill" size={20} className="text-white" />
            )}
          </button>
        </div>

        <button
          type="submit"
          className="cursor-pointer w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded flex flex-row gap-1 text-center items-center justify-center"
          disabled={loading}
        >
          {loading ? (
            <>
              <IconRenderer
                name="RiLoginBoxFill"
                size={20}
                className="text-white"
              />
              Loggin in ...
            </>
          ) : (
            <>
              <IconRenderer
                name="RiLoginBoxLine"
                size={20}
                className="text-white"
              />
              Login
            </>
          )}
        </button>

        {DEMO_MODE && (
          <>
            <div className="flex items-center my-4">
              <div className="grow border-t border-gray-700" />
              <span className="mx-3 text-xs text-gray-400 tracking-wider uppercase">
                Demo Access
              </span>
              <div className="grow border-t border-gray-700" />
            </div>

            <div className="flex flex-col gap-2 mt-4">
              <button
                disabled={loading}
                onClick={() => handleDemoLogin("admin")}
                className="cursor-pointer w-full py-2 bg-slate-700 hover:bg-slate-600 text-white rounded flex flex-row gap-1 text-center items-center justify-center"
              >
                <IconRenderer
                  name="RiShieldUserLine"
                  size={20}
                  className="text-white"
                />
                Admin
              </button>

              <button
                disabled={loading}
                onClick={() => handleDemoLogin("staff")}
                className="cursor-pointer w-full py-2 bg-slate-700 hover:bg-slate-600 text-white rounded flex flex-row gap-1 text-center items-center justify-center"
              >
                <IconRenderer
                  name="RiUserLine"
                  size={20}
                  className="text-white"
                />
                Staff
              </button>

              <button
                disabled={loading}
                onClick={() => handleDemoLogin("dev")}
                className="cursor-pointer w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded flex flex-row gap-1 text-center items-center justify-center"
              >
                <IconRenderer
                  name="RiTerminalBoxLine"
                  size={20}
                  className="text-white"
                />
                Developer
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
