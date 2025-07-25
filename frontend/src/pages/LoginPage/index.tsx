import { useState } from "react";

import { useAuthRedirect } from "../../hooks/useAuthRedirect";
import { login } from "./login.api";
import { useNavigate } from "react-router-dom";
import { IconRenderer } from "../../components/IconRenderer";

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
      const { token, refreshToken, user } = await login({ username, password });

      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(user));

      console.log("Login success", user);
      setTimeout(() => {
        // window.location.href = "/";
        navigate("/", { replace: true });
      }, 1000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-6 rounded shadow-md w-80 space-y-4"
      >
        <h2 className="text-2xl font-bold text-rose-400 text-center flex flex-col items-center">
          <IconRenderer
            name="RiLock2Line"
            size={300}
            className="text-gray-900"
          />
        </h2>

        {error && <div className="text-red-400 text-sm">{error}</div>}

        <input
          type="text"
          placeholder="Username or Email"
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
          className="w-full py-2 bg-rose-500 hover:bg-rose-600 text-white rounded flex flex-row gap-1 text-center items-center justify-center"
          disabled={loading}
        >
          {loading ? (
            <>
              <IconRenderer
                name="RiKey2Line"
                size={20}
                className="text-white"
              />
              Loggin in ...
            </>
          ) : (
            <>
              <IconRenderer name="RiKeyLine" size={20} className="text-white" />
              Login
            </>
          )}
        </button>
      </form>
    </div>
  );
}
