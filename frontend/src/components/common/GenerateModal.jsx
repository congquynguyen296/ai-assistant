import { useState, useEffect } from "react";
import { X, Sparkles } from "lucide-react";

/**
 * GenerateModal component
 * Modal dùng chung để tạo quiz hoặc flashcard với các tùy chọn:
 * - Tiêu đề (optional)
 * - Số lượng (required)
 * - Yêu cầu thêm (optional)
 */
const GenerateModal = ({
  isOpen,
  onClose,
  onGenerate,
  loading,
  title = "Tạo nội dung mới",
  description = "Nhập thông tin để tạo nội dung",
  countLabel = "Số lượng",
  defaultCount = 5,
  maxCount = 20,
}) => {
  // State quản lý các input
  const [count, setCount] = useState(defaultCount);
  const [customTitle, setCustomTitle] = useState("");
  const [requirements, setRequirements] = useState("");

  // Reset form khi mở modal
  useEffect(() => {
    if (isOpen) {
      setCount(defaultCount);
      setCustomTitle("");
      setRequirements("");
    }
  }, [isOpen, defaultCount]);

  // Handle submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    // Gửi dữ liệu về component cha
    onGenerate({ count, title: customTitle, requirements });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-white/95 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-lg shadow-slate-900/20 p-6">
        {/* Close button */}
        <button
          className="absolute top-6 right-6 h-8 w-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200"
          onClick={onClose}
          disabled={loading}
        >
          <X className="w-5 h-5" strokeWidth={2} />
        </button>

        {/* Modal header */}
        <div className="mb-6">
          <div className="w-12 h-12 rounded-xl bg-linear-to-r from-emerald-100 to-teal-100 flex items-center justify-center mb-3">
            <Sparkles className="w-6 h-6 text-emerald-600" strokeWidth={2} />
          </div>
          <h2 className="text-xl font-medium text-slate-900 tracking-tight">
            {title}
          </h2>
          <p className="text-sm text-slate-500 mt-1">{description}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title Input (Optional) */}
          <div>
            <label
              htmlFor="customTitle"
              className="block text-sm font-semibold text-slate-700 mb-2"
            >
              Tiêu đề (Tùy chọn)
            </label>
            <input
              type="text"
              id="customTitle"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              className="w-full h-11 px-4 border-2 border-slate-200 rounded-xl bg-white text-slate-900 text-sm font-medium focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
              placeholder="Nhập tiêu đề (nếu có)"
              disabled={loading}
            />
          </div>

          {/* Count Input */}
          <div>
            <label
              htmlFor="count"
              className="block text-sm font-semibold text-slate-700 mb-2"
            >
              {countLabel}
            </label>
            <input
              type="number"
              id="count"
              min="1"
              max={maxCount}
              value={count}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (!isNaN(value) && value >= 1 && value <= maxCount) {
                  setCount(value);
                } else if (e.target.value === "") {
                  setCount("");
                }
              }}
              className="w-full h-11 px-4 border-2 border-slate-200 rounded-xl bg-white text-slate-900 text-sm font-medium focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
              placeholder={`Nhập số lượng (1-${maxCount})`}
              required
              disabled={loading}
            />
            <p className="text-xs text-slate-500 mt-2">
              Số lượng tối thiểu: 1, tối đa: {maxCount}
            </p>
          </div>

          {/* Requirements Input (Optional) */}
          <div>
            <label
              htmlFor="requirements"
              className="block text-sm font-semibold text-slate-700 mb-2"
            >
              Yêu cầu thêm (Tùy chọn)
            </label>
            <textarea
              id="requirements"
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              className="w-full h-24 px-4 py-3 border-2 border-slate-200 rounded-xl bg-white text-slate-900 text-sm font-medium focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 resize-none"
              placeholder="Ví dụ: Tập trung vào các khái niệm cơ bản, định nghĩa..."
              disabled={loading}
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 h-11 px-4 border-2 border-slate-200 rounded-xl bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || !count || count < 1 || count > maxCount}
              className="flex-1 h-11 px-4 bg-linear-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-emerald-500/25 hover:from-emerald-600 hover:to-teal-600 hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang tạo...
                </span>
              ) : (
                "Tạo ngay"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GenerateModal;
