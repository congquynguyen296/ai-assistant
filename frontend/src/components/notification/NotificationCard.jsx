import {
  BookOpen,
  BrainCircuit,
  Info,
  CheckCircle2,
  AlertCircle,
  Bell,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const NotificationCard = ({ notification, onClose }) => {
  const navigate = useNavigate();

  const { title, message, type, time, isRead, link } = notification;

  const getIcon = () => {
    switch (type) {
      case "quiz":
        return <BrainCircuit size={18} className="text-purple-500" />;
      case "flashcard":
        return <BookOpen size={18} className="text-blue-500" />;
      case "success":
        return <CheckCircle2 size={18} className="text-emerald-500" />;
      case "warning":
        return <AlertCircle size={18} className="text-amber-500" />;
      default:
        return <Bell size={18} className="text-slate-500" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case "quiz":
        return "bg-purple-50";
      case "flashcard":
        return "bg-blue-50";
      case "success":
        return "bg-emerald-50";
      case "warning":
        return "bg-amber-50";
      default:
        return "bg-slate-50";
    }
  };

  const handleClick = () => {
    if (link) {
      navigate(link);
      if (onClose) onClose();
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`p-3 rounded-xl transition-all duration-200 cursor-pointer border border-transparent hover:bg-slate-50 group relative ${
        !isRead ? "bg-slate-50/40" : "bg-white"
      }`}
    >
      <div className="flex gap-3">
        <div
          className={`mt-1 w-9 h-9 rounded-xl ${getBgColor()} flex items-center justify-center shrink-0 transition-transform group-hover:scale-105`}
        >
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-0.5">
            <h4
              className={`text-sm font-semibold truncate ${
                !isRead ? "text-slate-900" : "text-slate-700"
              }`}
            >
              {title}
            </h4>
            <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0">
              {time}
            </span>
          </div>
          <p
            className={`text-xs truncate ${
              !isRead ? "text-slate-600" : "text-slate-500"
            }`}
          >
            {message}
          </p>
        </div>
        {!isRead && (
          <div className="absolute top-4 right-3 w-2 h-2 bg-emerald-500 rounded-full"></div>
        )}
      </div>
    </div>
  );
};

export default NotificationCard;
