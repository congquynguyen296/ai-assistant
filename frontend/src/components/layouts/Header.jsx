import { useAuth } from "@/context/AuthContext";
import { Bell, Menu, User } from "lucide-react";
import { useState } from "react";
import NotificationDialog from "../notification/NotificationDialog";
import { toast } from "sonner";

const Header = ({ toggleSidebar }) => {
  const { user } = useAuth();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Mock data notifications
  const notifications = [
    {
      id: 1,
      title: "Bài Quiz chưa hoàn thành",
      message:
        "Bạn đang làm dở bài Quiz 'Lập trình ReactJS cơ bản'. Tiếp tục ngay để không quên kiến thức nhé!",
      type: "quiz",
      time: "2 giờ trước",
      isRead: false,
      link: "/quizzes",
    },
    {
      id: 2,
      title: "Flashcard mới được tạo",
      message:
        "Hệ thống đã tạo thành công bộ Flashcard từ tài liệu 'Giáo trình Triết học' của bạn.",
      type: "flashcard",
      time: "5 giờ trước",
      isRead: false,
      link: "/flashcards",
    },
    {
      id: 3,
      title: "Chào mừng bạn quay lại",
      message: "Chúc bạn một ngày học tập hiệu quả cùng Hyra AI!",
      type: "success",
      time: "1 ngày trước",
      isRead: true,
      link: null,
    },
  ];

  return (
    <header className="sticky top-0 z-30 w-full h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200">
      <div className="flex items-center justify-between h-full px-6">
        {/* Mobile menu */}
        <button
          onClick={toggleSidebar}
          className="md:hidden inline-flex items-center justify-center w-10 h-10 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all duration-200"
          aria-label="Toggle Sidebar"
        >
          <Menu size={24} />
        </button>

        <div className="hidden md:block"></div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              // onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              onClick={() =>
                toast.info(
                  "Tính năng đang trong quá trình nghiên cứu và phát triển"
                )
              }
              className={`relative inline-flex items-center justify-center w-10 h-10 text-slate-600 hover:bg-slate-100 rounded-xl transition-all duration-200 group ${
                isNotificationOpen ? "bg-slate-100 text-slate-900" : ""
              }`}
            >
              <Bell
                size={20}
                strokeWidth={2}
                className="group-hover:scale-110 transition-transform duration-200"
              />
              {notifications.some((n) => !n.isRead) && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white"></span>
              )}
            </button>

            {/* <NotificationDialog 
                isOpen={isNotificationOpen} 
                onClose={() => setIsNotificationOpen(false)}
                notifications={notifications}
            /> */}
          </div>

          {/* User profile */}
          <div className="flex items-center gap-3 pl-3 border-l border-slate-200/60">
            <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-colors duration-200 cursor-pointer group">
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt="Avatar"
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-xl object-cover shadow-md shadow-emerald-500/20 group-hover:shadow-emerald-500/30 transition-all duration-200"
                />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-linear-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:shadow-emerald-500/30 transition-all duration-200">
                  <User size={20} strokeWidth={2.5} />
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {user ? user.username : "User"}
                </p>
                <p className="text-xs text-slate-500">
                  {user?.email || "user@example.com"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
