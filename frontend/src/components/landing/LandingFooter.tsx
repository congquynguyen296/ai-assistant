import Logo from "@/assets/logo.svg";

export const LandingFooter = () => {
  return (
    <footer className="mt-20 border-t border-slate-200/80 pt-8 pb-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm font-medium text-slate-500">
      <div className="flex items-center gap-3">
        <img src={Logo} alt="Hyra" className="h-6 w-auto grayscale opacity-70" />
        <span>© 2026 Hyra Platform. All rights reserved.</span>
      </div>
      <div className="flex items-center gap-6">
        <a href="#" className="hover:text-slate-900 transition-colors">Điều khoản</a>
        <a href="#" className="hover:text-slate-900 transition-colors">Bảo mật</a>
        <a href="#" className="hover:text-slate-900 transition-colors">Liên hệ</a>
      </div>
    </footer>
  );
};
