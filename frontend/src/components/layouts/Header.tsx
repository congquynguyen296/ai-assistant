import { useAuth } from "@/context/AuthContext";
import { Bell, Menu, User } from "lucide-react";
import { useState } from "react";
import NotificationDialog from "@/components/notification/NotificationDialog";
import { toast } from "sonner";
import type { NotificationItem } from "@/types/models";
import { getNotifications, markAllAsRead, deleteAllRead, markAsRead } from "@/services/notificationService";
import { useEffect } from "react";
import { connectSocket, disconnectSocket } from "@/services/socketService";

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header = ({ toggleSidebar }: HeaderProps) => {
  const { user } = useAuth();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const userId = user?._id || (user as any)?.id;
      if (!userId) return;
      try {
        const response = await getNotifications();
        console.log("Fetched notifications from API:", response.data);
        setNotifications(response.data || []);
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      }
    };
    
    const userId = user?._id || (user as any)?.id;
    if (userId) {
      fetchNotifications();
      
      const socket = connectSocket(userId);
      
      socket.on("new_notification", (notification: NotificationItem) => {
        console.log("Received new_notification from socket:", notification);
        setTimeout(() => {
          setNotifications((prev) => {
            console.log("Previous notifications state:", prev);
            const next = [notification, ...prev];
            console.log("Next notifications state:", next);
            return next;
          });
          toast[notification.type === 'error' ? 'error' : 'success'](notification.title, {
            description: notification.message,
          });
        }, 5000);
      });

      return () => {
        socket.off("new_notification");
      };
    }
  }, [user]);

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  };

  const handleDeleteAllRead = async () => {
    try {
      await deleteAllRead();
      setNotifications((prev) => prev.filter((n) => !n.isRead));
    } catch (error) {
      console.error("Failed to delete all read", error);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      await markAsRead(id);
    } catch (error) {
      console.error("Failed to mark as read", error);
      // Optional: Revert optimistic update here if needed
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200">
      <div className="flex items-center justify-between h-full px-4 md:px-6">
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
              onClick={(e) => {
                e.stopPropagation();
                setIsNotificationOpen((prev) => !prev);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              className={`relative inline-flex items-center justify-center w-10 h-10 text-slate-600 hover:bg-slate-100 rounded-xl transition-all duration-200 group ${
                isNotificationOpen ? "bg-slate-100 text-slate-900" : ""
              }`}
            >
              <Bell
                size={20}
                strokeWidth={2}
                className="group-hover:scale-110 transition-transform duration-200"
              />
              {!isNotificationOpen && notifications.some((n) => !n.isRead) && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white"></span>
              )}
            </button>

            <NotificationDialog 
                isOpen={isNotificationOpen} 
                onClose={() => setIsNotificationOpen(false)}
                notifications={notifications}
                onMarkAllAsRead={handleMarkAllAsRead}
                onDeleteAllRead={handleDeleteAllRead}
                onMarkAsRead={handleMarkAsRead}
            />
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
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-slate-900">
                  {user ? user.username : "User"}
                </p>
                <p className="text-xs text-slate-500 max-w-[150px] truncate">
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
