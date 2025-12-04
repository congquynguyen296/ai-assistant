import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";
import authService from "../../services/authService";
import { ArrowRight, BrainCircuit, Lock, Mail } from "lucide-react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusField, setFocusFiled] = useState(null);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await authService.login(email, password);
      const { user, token } = response?.data;
      toast.success("Đăng nhập thành công");
      navigate("/dashboard");
    } catch (error) {
      setError(error.message || "Đăng nhập không thành công");
      toast.error("Đăng nhập không thành công");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-around min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-50">
      <div className="absolute">
        <div className="relative w-full max-w-md px-6">
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 shadow-xl shadow-slate-200/50 p-10">
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
            <div className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                {" "}
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
                    onFocus={() => setFocusFiled("email")}
                    onBlur={() => setFocusFiled(null)}
                    placeholder="you@example.com"
                    className="w-full h-12 pl-12 pr-4 border-2 border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 placeholder-slate-400 text-sm font-medium transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:bg-white focus:shadow-lg focus:shadow-emerald-500/10"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                {" "}
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
                    onFocus={() => setFocusFiled("password")}
                    onBlur={() => setFocusFiled(null)}
                    placeholder="********"
                    className="w-full h-12 pl-12 pr-4 border-2 border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 placeholder-slate-400 text-sm font-medium transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:bg-white focus:shadow-lg focus:shadow-emerald-500/10  "
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
                onClick={handleSubmit}
                disabled={loading}
                className="group relative w-full h-12 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 active:scale-[0.98] text-white font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 shadow-lg shadow-emerald-500/25 overflow-hidden"
              >
                <span className="relative text-sm z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2  border-white/30 border-t-white rounded-full animate-spin"></div>
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
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-slate-200/60">
              <p className="text-center text-sm text-slate-600">
                Chưa có tài khoản?{" "}
                <Link
                  to={"/register"}
                  className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors duration-200"
                >
                  {" "}
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
    </div>
  );
};

export default LoginPage;
