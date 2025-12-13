import { X } from "lucide-react";
import MarkdownRenderer from "./MarkdownRerender";

const InfoModal = ({
  isOpen,
  onClose,
  title,
  content,
  icon: Icon,
  variant = "info", // "info" | "success" | "warning"
}) => {
  if (!isOpen) return null;

  // Variant styles
  const variantStyles = {
    info: {
      iconBg: "bg-linear-to-r from-blue-100 to-cyan-100",
      iconColor: "text-blue-600",
    },
    success: {
      iconBg: "bg-linear-to-r from-emerald-100 to-teal-100",
      iconColor: "text-emerald-600",
    },
    warning: {
      iconBg: "bg-linear-to-r from-yellow-100 to-orange-100",
      iconColor: "text-yellow-600",
    },
  };

  const styles = variantStyles[variant] || variantStyles.info;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white/95 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-lg shadow-slate-900/20 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200/60">
          <div className="flex items-center gap-4">
            {Icon && (
              <div
                className={`w-12 h-12 rounded-xl ${styles.iconBg} flex items-center justify-center`}
              >
                <Icon className={`w-6 h-6 ${styles.iconColor}`} strokeWidth={2} />
              </div>
            )}
            <h2 className="text-xl font-medium text-slate-900 tracking-tight">
              {title}
            </h2>
          </div>
          <button
            className="h-8 w-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200"
            onClick={onClose}
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="prose prose-slate max-w-none">
            <MarkdownRenderer content={content} />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200/60">
          <button
            onClick={onClose}
            className="w-full h-11 px-4 bg-linear-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg shadow-slate-500/25"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;

