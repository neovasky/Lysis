/**
 * File: src/pages/Auth/AuthPage.tsx
 * Description: Authentication page component using shadcn styling with Tailwind CSS and lucide-react icons
 */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { handleGoogleSignIn } from "../../utils/googleAuth";

interface AuthFormData {
  email: string;
  password: string;
}

export const AuthPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AuthFormData>({
    email: "",
    password: "",
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (loading) return;
    try {
      setLoading(true);
      await login(formData.email, formData.password);
      navigate("/");
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      await handleGoogleSignIn();
      await login("google@example.com", "google-auth");
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Google login error:", err);
      setError("Google login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center bg-background pb-[25vh]">
      <div className="w-full flex justify-center">
        <div className="w-[380px] bg-gray-200 p-6 rounded shadow">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="mb-2">
              <h2 className="text-xl font-bold mb-1">Welcome Back</h2>
              <p className="text-gray-600 text-sm">
                Sign in to access your investment workspace
              </p>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              Continue with Google
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-grow h-px bg-gray-400"></div>
              <p className="text-gray-600 text-sm">or</p>
              <div className="flex-grow h-px bg-gray-400"></div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                disabled={loading}
                className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-gray-800 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  disabled={loading}
                  className="w-full p-2 pr-12 border border-gray-300 rounded bg-gray-100 text-gray-800 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-2 rounded bg-red-200 border border-red-400">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              Sign In
            </button>

            <div className="flex items-center justify-center gap-2">
              <p className="text-gray-600 text-sm">Don't have an account?</p>
              <button
                type="button"
                onClick={() => navigate("/auth/signup")}
                disabled={loading}
                className="text-blue-500 hover:underline text-sm"
              >
                Sign up
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
