import { useState } from "react";

import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { login } from "./login.api";
import { useNavigate } from "react-router-dom";
import { IconRenderer } from "@/components/IconRenderer";

export default function LoginPage() {
  useAuthRedirect();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { token, user } = await login({ username, password });

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setTimeout(() => {
        navigate("/", { replace: true });
      }, 1000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--content-surface)] text-[var(--content-text)]">
      <form
        onSubmit={handleSubmit}
        className="bg-[var(--content-surface)] p-6 rounded shadow-md w-80 space-y-4"
      >
        <h2 className="text-2xl font-bold text-blue-400 text-center flex flex-col items-center">
          <IconRenderer
            name="RiLock2Line"
            size={300}
            className="text-gray-900"
          />
        </h2>

        {error && <div className="text-blue-400 text-sm">{error}</div>}

        <input
          type="text"
          placeholder="Username or Email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-[var(--content-text)] outline-none"
          required
        />

        <div className="relative w-full">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-[var(--content-text)] outline-none pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[var(--content-text)] hover:text-[var(--content-text)] cursor-pointer"
            tabIndex={-1}
          >
            {showPassword ? (
              <IconRenderer
                name="RiEyeCloseLine"
                size={20}
                className="text-[var(--content-text)]"
              />
            ) : (
              <IconRenderer
                name="RiEyeFill"
                size={20}
                className="text-[var(--content-text)]"
              />
            )}
          </button>
        </div>

        <button
          type="submit"
          className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-[var(--content-text)] rounded flex flex-row gap-1 text-center items-center justify-center"
          disabled={loading}
        >
          {loading ? (
            <>
              <IconRenderer
                name="RiKey2Line"
                size={20}
                className="text-[var(--content-text)]"
              />
              Loggin in ...
            </>
          ) : (
            <>
              <IconRenderer
                name="RiKeyLine"
                size={20}
                className="text-[var(--content-text)]"
              />
              Login
            </>
          )}
        </button>
      </form>
    </div>
  );
}
