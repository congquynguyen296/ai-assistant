import { X } from "lucide-react";

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Xác nhận xóa",
  message,
  confirmText = "Xóa",
  cancelText = "Hủy",
  isLoading = false,
  icon: Icon,
  variant = "danger", // "danger" | "warning" | "info"
}) => {
  if (!isOpen) return null;

  // Variant styles
  const variantStyles = {
    danger: {
      iconBg: "bg-linear-to-r from-red-100 to-red-200",
      iconColor: "text-red-600",
      buttonBg: "bg-red-500 hover:bg-red-600",
      buttonShadow: "shadow-red-500/25",
    },
    warning: {
      iconBg: "bg-linear-to-r from-yellow-100 to-yellow-200",
      iconColor: "text-yellow-600",
      buttonBg: "bg-yellow-500 hover:bg-yellow-600",
      buttonShadow: "shadow-yellow-500/25",
    },
    info: {
      iconBg: "bg-linear-to-r from-blue-100 to-blue-200",
      iconColor: "text-blue-600",
      buttonBg: "bg-blue-500 hover:bg-blue-600",
      buttonShadow: "shadow-blue-500/25",
    },
  };

  const styles = variantStyles[variant] || variantStyles.danger;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-white/95 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-lg shadow-slate-900/20 p-4">
        {/* Close button */}
        <button
          className="absolute top-6 right-6 h-8 w-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200"
          onClick={onClose}
          disabled={isLoading}
        >
          <X className="w-5 h-5" strokeWidth={2} />
        </button>

        {/* Modal header */}
        <div className="mb-6">
          {Icon && (
            <div
              className={`w-12 h-12 rounded-xl ${styles.iconBg} flex items-center justify-center mb-3`}
            >
              <Icon className={`w-6 h-6 ${styles.iconColor}`} strokeWidth={2} />
            </div>
          )}
          <h2 className="text-xl font-medium text-slate-900 tracking-tight">
            {title}
          </h2>
        </div>

        {/* Content */}
        {message && (
          <div className="text-sm text-slate-500 mb-6">{message}</div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 h-11 px-4 border-2 border-slate-200 rounded-xl bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 h-10 px-4 ${styles.buttonBg} text-white rounded-xl text-sm font-semibold shadow-lg ${styles.buttonShadow} hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Đang xử lý...
              </span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;

