import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";
import authService from "../../services/authService";
import { validateLogin } from "../../utils/validation";
import { ArrowRight, BrainCircuit, Lock, Mail } from "lucide-react";
import GoogleButton from "../../components/auth/GoogleButton";
import FacebookButton from "../../components/auth/FacebookButton";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusField, setFocusField] = useState(null);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    // Validate data using validation utility
    const validation = validateLogin(email, password);
    if (!validation.isValid) {
      setError(validation.error);
      setFocusField(validation.field);
      setLoading(false);
      return;
    }

    try {
      const response = await authService.login(email.trim(), password.trim());
      const { user, token } = response?.data || response;
      login(user, token);
      toast.success("Đăng nhập thành công");
      navigate("/dashboard");
    } catch (error) {
      const errorMessage =
        error?.message ||
        error?.response?.data?.message ||
        "Đăng nhập không thành công";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const params = new URLSearchParams({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      redirect_uri: import.meta.env.VITE_GOOGLE_REDIRECT_URI,
      response_type: "code",
      scope: "openid email profile",
      access_type: "offline",
      prompt: "consent",
    });
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-50">
      <div className="w-full max-w-lg px-6">
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 shadow-xl shadow-slate-200/50 p-10 rounded-2xl">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-linear-to-br from-emerald-400 to-emerald-500 shadow-lg shadow-emerald-500/25 mb-6">
              <BrainCircuit className="w-7 h-7 text-white" strokeWidth={2} />
            </div>
            <h1 className="text-2xl font-medium text-slate-900 tracking-tight mb-2">
              Chào mừng trở lại
            </h1>
            <p className="text-slate-500 text-sm">Đăng nhập để tiếp tục</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
                Email
              </label>
              <div className="relative group">
                <div
                  className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200
                  ${
                    focusField === "email"
                      ? "text-emerald-500"
                      : "text-slate-500"
                  }`}
                >
                  <Mail className="w-5 h-5" strokeWidth={2} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusField("email")}
                  onBlur={() => setFocusField(null)}
                  placeholder="you@example.com"
                  className="w-full h-12 pl-12 pr-4 border-2 border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 placeholder-slate-400 text-sm font-medium transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:bg-white focus:shadow-lg focus:shadow-emerald-500/10"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
                Mật khẩu
              </label>
              <div className="relative group">
                <div
                  className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200
                  ${
                    focusField === "password"
                      ? "text-emerald-500"
                      : "text-slate-500"
                  }`}
                >
                  <Lock className="w-5 h-5" strokeWidth={2} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusField("password")}
                  onBlur={() => setFocusField(null)}
                  placeholder="********"
                  className="w-full h-12 pl-12 pr-4 border-2 border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 placeholder-slate-400 text-sm font-medium transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:bg-white focus:shadow-lg focus:shadow-emerald-500/10"
                />
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                <p className="text-xs text-red-500 font-medium text-center">
                  {error}
                </p>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="group relative w-full h-12 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 active:scale-[0.98] text-white font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 shadow-lg shadow-emerald-500/25 overflow-hidden"
            >
              <span className="relative text-sm z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  </>
                ) : (
                  <>
                    Đăng nhập{" "}
                    <ArrowRight
                      className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200"
                      strokeWidth={2.5}
                    />
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-500 font-medium">
                Hoặc đăng nhập với
              </span>
            </div>
          </div>

          {/* Login with social */}
          <div className="grid w-full grid-cols-2 gap-3">
            <GoogleButton onClick={handleGoogleLogin} />
            <FacebookButton
              onClick={() => {
                // TODO: Implement Facebook login logic
                console.log("Facebook login clicked");
              }}
            />
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-slate-200/60">
            <p className="text-center text-sm text-slate-600">
              Chưa có tài khoản?{" "}
              <Link
                to={"/register"}
                className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors duration-200"
              >
                Đăng ký
              </Link>
            </p>
          </div>
        </div>

        {/* Sub footer */}
        <p className="text-center text-sm text-slate-500 mt-6">
          Trang này tạo ra là cho Huỳnh Mỹ Huyền dùng.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
