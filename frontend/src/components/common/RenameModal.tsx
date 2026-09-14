import React, { useState, useEffect } from "react";

interface RenameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newTitle: string) => void;
  title: string;
  description: string;
  initialValue?: string;
  isLoading?: boolean;
}

const RenameModal: React.FC<RenameModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  initialValue = "",
  isLoading = false,
}) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (isOpen) {
      setValue(initialValue);
    }
  }, [isOpen, initialValue]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onConfirm(value.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white/95 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-lg shadow-slate-900/20 p-5 sm:p-6">
        <h2 className="text-xl font-medium text-slate-900 tracking-tight mb-1">
          {title}
        </h2>
        <p className="text-sm text-slate-500 mb-5">{description}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required
            autoFocus
            className="w-full h-11 px-4 border border-slate-300 rounded-xl bg-slate-50/50 text-slate-900 text-sm font-medium focus:outline-none focus:border-emerald-500 focus:bg-white transition-all duration-200"
            placeholder="Nhập tên mới..."
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 h-11 px-4 border-2 border-slate-200 rounded-xl bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading || !value.trim()}
              className="flex-1 h-11 px-4 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-emerald-500/25 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang lưu...
                </span>
              ) : (
                "Lưu"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RenameModal;
