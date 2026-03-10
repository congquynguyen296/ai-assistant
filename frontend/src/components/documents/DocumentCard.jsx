import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import moment from "moment";
import { BookOpen, BrainCircuit, Clock, FileText, MoreVertical, Pencil, Trash2 } from "lucide-react";

// Func to format file size
const formatFileSize = (bytes) => {
  if (bytes === undefined || bytes === null) return "N/A";

  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

const DocumentCard = ({ document, onDelete, onRename }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const handleNavigate = () => {
    navigate(`/documents/${document._id}`);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    onDelete(document);
  };

  const handleRename = (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    onRename(document);
  };

  const toggleMenu = (e) => {
    e.stopPropagation();
    setMenuOpen((prev) => !prev);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      window.addEventListener("mousedown", handleClickOutside);
    }
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <div
      className="group relative bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-5 hover:border-emerald-600/50 transition-all duration-300 flex flex-col justify-between cursor-pointer"
      onClick={handleNavigate}
    >
      {/* Header section */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="shrink-0 w-12 h-12 bg-linear-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/25 group-hover:scale-100 transition-transform duration-300">
            <FileText className="w-6 h-6 text-white" strokeWidth={2} />
          </div>
          {/* 3-dot menu */}
          <div ref={menuRef} className="relative">
            <button
              onClick={toggleMenu}
              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all duration-200 cursor-pointer"
            >
              <MoreVertical className="w-4 h-4" strokeWidth={2} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-9 z-20 w-44 bg-white border border-slate-200 rounded-xl shadow-lg shadow-slate-200/50 py-1 overflow-hidden">
                <button
                  onClick={handleRename}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors duration-150"
                >
                  <Pencil className="w-4 h-4 text-slate-400" strokeWidth={2} />
                  Đổi tên
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                >
                  <Trash2 className="w-4 h-4 text-red-500" strokeWidth={2} />
                  Xóa tài liệu
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-balance font-semibold text-slate-900 truncate mb-2">
          {document.title || "Không có tiêu đề"}
        </h3>

        {/* Info */}
        <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
          {document.fileSize !== undefined && (
            <>
              <span className="font-medium">
                {formatFileSize(document.fileSize)}
              </span>
            </>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3">
          {document.flashcardCount !== undefined && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-purple-50 rounded-lg">
              <BookOpen
                className="w-3.5 h-3.5 text-purple-600"
                strokeWidth={2}
              />
              <span className="text-xs font-semibold text-purple-700">
                {document.flashcardCount} Flashcards
              </span>
            </div>
          )}
          {document.quizCount !== undefined && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 rounded-lg">
              <BrainCircuit
                className="w-3.5 h-3.5 text-emerald-600"
                strokeWidth={2}
              />
              <span className="text-xs font-semibold text-emerald-700">
                {document.quizCount} Quizzes
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer section */}
      <div className="mt-5 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Clock className="w-3.5 h-3.5" strokeWidth={2} />
          <span className="">
            Uploaded {moment(document.createdAt).fromNow()}
          </span>
        </div>
      </div>

      {/* Hover indicator */}
      <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-emerald-500/0 to-teal-500/0 group-hover:from-emerald-500/5 group-hover:to-teal-500/5 transition-all duration-300 pointer-events-none"></div>
    </div>
  );
};

export default DocumentCard;
