import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import authService from "../../services/authService";
import { ArrowRight, ArrowLeft, Clock, Mail, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";

const ConfirmOTPPage = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(300); // 5 minutes in seconds
  const [canResend, setCanResend] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const email = location.state?.email;

  // Redirect if no email in state
  useEffect(() => {
    if (!email) {
      toast.error("Không tìm thấy thông tin email. Vui lòng đăng ký lại.");
      navigate("/register");
    }
  }, [email, navigate]);

  // Func to handle countdown timer
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error("Vui lòng nhập mã OTP hợp lệ (6 chữ số)");
      return;
    }

    setLoading(true);
    try {
      const response = await authService.verifyOTP(email, otp);
      const { user, token } = response?.data || response;

      if (user && token) {
        login(user, token);
        toast.success("Xác thực thành công! Đang chuyển hướng...");
        navigate("/dashboard");
      } else {
        toast.error("Xác thực thất bại. Vui lòng thử lại.");
      }
    } catch (error) {
      const errorMessage =
        error?.message ||
        error?.response?.data?.message ||
        "Xác thực không thành công";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    setLoading(true);
    try {
      await authService.resendOTP(email);
      toast.success("Mã OTP mới đã được gửi đến email của bạn");
      setTimer(300);
      setCanResend(false);
      setOtp("");
    } catch (error) {
      const errorMessage =
        error?.message ||
        error?.response?.data?.message ||
        "Gửi lại OTP thất bại";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-50">
      <div className="w-full max-w-md px-6">
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 shadow-xl shadow-slate-200/50 p-10 rounded-2xl">
          <Link
            to="/register"
            className="inline-flex mb-4 items-center gap-2 text-sm text-neutral-600 hover:text-neutral-800 transition-colors"
          >
            <ArrowLeft size={16} />
            Quay lại
          </Link>

          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-linear-to-br from-emerald-400 to-emerald-500 shadow-lg shadow-emerald-500/25 mb-6">
              <Mail className="w-7 h-7 text-white" strokeWidth={2} />
            </div>
            <h1 className="text-2xl font-medium text-slate-900 tracking-tight mb-2">
              Xác thực Email
            </h1>
            <p className="text-slate-500 text-sm">
              Chúng tôi đã gửi mã OTP đến email <br />
              <span className="font-medium text-slate-700">{email}</span>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide text-center">
                Nhập mã OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, "");
                  if (value.length <= 6) setOtp(value);
                }}
                className="w-full text-center text-3xl font-bold tracking-[0.5em] py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 text-slate-800 placeholder:tracking-normal"
                placeholder="------"
                maxLength={6}
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-slate-500">
                <Clock className="w-4 h-4 mr-1.5" />
                <span>{formatTime(timer)}</span>
              </div>
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={!canResend || loading}
                className={`flex items-center font-medium transition-colors duration-200 ${
                  canResend
                    ? "text-emerald-600 hover:text-emerald-700 cursor-pointer"
                    : "text-slate-400 cursor-not-allowed"
                }`}
              >
                <RefreshCw
                  className={`w-4 h-4 mr-1.5 ${
                    loading && !canResend ? "animate-spin" : ""
                  }`}
                />
                Gửi lại mã
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full py-3.5 px-4 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium rounded-xl shadow-lg shadow-emerald-500/25 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:ring-offset-2 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Xác thực</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ConfirmOTPPage;
