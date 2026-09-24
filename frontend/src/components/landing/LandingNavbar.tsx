import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Logo from "@/assets/logo.svg";

export const LandingNavbar = () => {
  return (
    <header className="flex items-center justify-between py-4 animate-[fadeIn_0.5s_ease-out]">
      <div className="flex items-center gap-3">
        <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
          <img src={Logo} alt="Hyra" className="h-8 w-auto" />
        </div>
        <div className="hidden sm:block">
          <p className="text-lg font-bold text-slate-900 tracking-tight leading-none">Hyra</p>
          <p className="text-xs font-medium text-slate-500 mt-0.5">Nền tảng trí tuệ</p>
        </div>
      </div>
      <div className="flex items-center gap-4 sm:gap-6">
        <Link
          to="/login"
          className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          Đăng nhập
        </Link>
        <Link
          to="/register"
          className="group inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 sm:px-6 py-2.5 sm:py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 hover:shadow-slate-900/30 hover:-translate-y-0.5 transition-all"
        >
          Bắt đầu ngay
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
        </Link>
      </div>
    </header>
  );
};
