import { useAuth } from "@/context/AuthContext";
import {
  Banknote,
  BookOpen,
  BrainCircuit,
  FileText,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  User,
  X,
} from "lucide-react";
import Logo from "../../assets/logo.svg";
import { NavLink, useNavigate, Link } from "react-router-dom";

const Sidebar = ({ isSidebarOpen, toggleSidebar }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Navigate link to page
  const navLinks = [
    { to: "/dashboard", icon: LayoutDashboard, text: "Thống kê" },
    { to: "/documents", icon: FileText, text: "Tài liệu" },
    // { to: "/messages", icon: MessageCircle, text: "Tin nhắn" },
    { to: "/quizzes", icon: BrainCircuit, text: "Trắc nghiệm" },
    { to: "/payment", icon: Banknote, text: "Thanh toán" },
    { to: "/profile", icon: User, text: "Cá nhân" },
  ];

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/30 z-30 md:hidden transion-opacity duration-300 ${
          isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleSidebar}
        aria-hidden="true"
      ></div>

      <aside
        className={`group/sidebar fixed top-0 left-0 h-full w-64 bg-white/90 backdrop-blur-lg border-r border-slate-200/60 z-50 md:relative md:w-24 md:hover:w-64 md:shrink-0 md:flex md:flex-col md:translate-x-0 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full "
        }`}
      >
        {/* Logo and close button for mobile */}
        <div className="flex items-center min-h-16 justify-between px-5 border-b border-slate-200/60 md:px-5 transition-all duration-300">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center justify-center w-9 h-9">
              <Link to="/">
                <img
                  src={Logo}
                  alt="logo"
                  className="text-white h-9 w-auto"
                  size={18}
                  strokeWidth={2.5}
                />
              </Link>
            </div>
            <h1 className="text-sm md:text-base font-semibold whitespace-nowrap overflow-hidden transition-all duration-300 md:max-w-0 md:opacity-0 md:group-hover/sidebar:max-w-48 md:group-hover/sidebar:opacity-100">
              Hyra - Trợ lý học tập
            </h1>
          </div>

        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1.5">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={toggleSidebar}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 md:justify-center md:group-hover/sidebar:justify-start ${
                  isActive
                    ? `bg-linear-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20`
                    : `text-slate-700 hover:bg-slate-100 hover:text-slate-900`
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <link.icon
                    size={20}
                    strokeWidth={2.5}
                    className={`shrink-0 transition-transform duration-200 ${
                      isActive ? `` : `group-hover:scale-110`
                    }`}
                  />
                  <span className="whitespace-nowrap overflow-hidden transition-all duration-300 md:max-w-0 md:opacity-0 md:group-hover/sidebar:max-w-40 md:group-hover/sidebar:opacity-100">
                    {link.text}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout section */}
        <div className="px-3 py-4 border-t border-slate-200/60">
          <button
            onClick={handleLogout}
            className="group flex items-center gap-3 w-full px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200 md:justify-center md:group-hover/sidebar:justify-start"
          >
            <LogOut
              size={20}
              strokeWidth={2.5}
              className="shrink-0 transition-transform duration-200 group-hover:scale-110"
            />
            <span className="whitespace-nowrap overflow-hidden transition-all duration-300 md:max-w-0 md:opacity-0 md:group-hover/sidebar:max-w-32 md:group-hover/sidebar:opacity-100">
              Đăng xuất
            </span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
