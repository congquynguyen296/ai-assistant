import { useAuth } from "@/context/AuthContext";
import {
  Banknote,
  BookOpen,
  BrainCircuit,
  FileText,
  LayoutDashboard,
  LogOut,
  User,
  X,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

const Sidebar = ({ isSidebarOpen, toggleSidebar }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Navigate link to page
  const navLinks = [
    { to: "/dashboard", icon: LayoutDashboard, text: "Thống kê" },
    { to: "/documents", icon: FileText, text: "Tài liệu" },
    { to: "/flashcards", icon: BookOpen, text: "Câu hỏi" },
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
        className={`fixed top-0 left-0 h-full w-64 bg-white/90 backdrop-blur-lg border-r border-slate-200/60 z-50 md:relative md:w-64 md:shrink-0 md:flex md:flex-col md:translate-x-0 transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full "
        }`}
      >
        {/* Logo and close button for mobile */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-slate-200/60">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-linear-to-br from-emerald-400 to-teal-500 text-white shadow-md shadow-emerald-500/20">
              <BrainCircuit
                className="text-white"
                size={20}
                strokeWidth={2.5}
              />
            </div>
            <h1 className="text-sm md:text-base font-semibold">
              Hyra - Trợ lý học tập
            </h1>
          </div>
          <button
            className="md:hidden text-slate-500 hover:text-slate-50"
            onClick={toggleSidebar}
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1.5">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={toggleSidebar}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
                  isActive
                    ? `bg-linear-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20`
                    : `text-slate-700 hover:bg-slate-100 hover:text-slate-900`
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <link.icon
                    size={18}
                    strokeWidth={2.5}
                    className={`transition-transform duration-200 ${
                      isActive ? `` : `group-hover:scale-110`
                    }`}
                  />
                  {link.text}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout section */}
        <div className="px-3 py-4 border-t border-slate-200/60">
          <button
            onClick={handleLogout}
            className="group flex items-center gap-3 w-full px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200"
          >
            <LogOut
              size={18}
              strokeWidth={2.5}
              className="transition-transform duration-200 group-hover:scale-110"
            />
            Đăng xuất
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
