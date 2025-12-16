import { X, CheckCheck } from "lucide-react";
import NotificationCard from "./NotificationCard";
import { useEffect, useRef } from "react";

const NotificationDialog = ({ isOpen, onClose, notifications = [] }) => {
  const dialogRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dialogRef}
      className="absolute top-full -right mt-3 w-80 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right"
    >
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-slate-900">Thông báo</h3>
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600 text-xs font-bold">
            {notifications.filter((n) => !n.isRead).length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
            title="Đánh dấu tất cả đã đọc"
          >
            <CheckCheck size={16} />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors md:hidden"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
        {notifications.length > 0 ? (
          <div className="p-2 space-y-1">
            {notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onClose={onClose}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-sm text-slate-500">Không có thông báo nào</p>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-slate-100 bg-slate-50/50 text-center">
        <button className="text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:underline">
          Xem tất cả
        </button>
      </div>
    </div>
  );
};

export default NotificationDialog;
