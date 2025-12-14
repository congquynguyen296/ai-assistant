import { Link } from "react-router-dom";
import { Award, BarChart2, Play, Trash2, HelpCircle } from "lucide-react";
import moment from "moment";

const QuizCard = ({ quiz, onDelete }) => {
  const hasCompleted = quiz?.userAnswer?.length > 0;

  return (
    <div className="group relative bg-white/80 backdrop-blur-xl border-2 border-slate-200 hover:border-emerald-300 rounded-2xl p-6 transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/10 flex flex-col justify-between">
      {/* Delete button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(quiz);
        }}
        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 cursor-pointer z-10"
        title="Xóa quiz"
      >
        <Trash2 className="w-5 h-5" strokeWidth={2} />
      </button>

      {/* Header section */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-linear-to-br from-emerald-100 to-teal-100">
            <HelpCircle
              className="w-6 h-6 text-emerald-600"
              strokeWidth={2}
            />
          </div>
        </div>

        <div className="mb-4">
          <h3
            className="text-base font-semibold text-slate-900 mb-2 line-clamp-2"
            title={quiz?.title}
          >
            {quiz?.title ||
              `Quiz - ${moment(quiz?.createdAt).format("MMM D, YYYY")}`}
          </h3>
          <p className="text-xs font-medium text-slate-500">
            Tạo vào {moment(quiz?.createdAt).format("MMM D, YYYY")}
          </p>
        </div>

        {/* Status badge */}
        {hasCompleted && (
          <div className="mb-4">
            <div className="inline-flex items-center gap-1.5 bg-emerald-100 border border-emerald-300 rounded-xl px-3 py-1.5">
              <Award className="w-4 h-4 text-emerald-600" strokeWidth={2.5} />
              <span className="text-sm font-semibold text-emerald-700">
                Điểm: {Math.round(quiz?.score || 0)}%
              </span>
            </div>
          </div>
        )}

        {/* Quiz info */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between gap-2">
            <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-sm font-semibold text-slate-700">
                {quiz?.totalQuestions || 0} câu hỏi
              </span>
            </div>
            {!hasCompleted && (
              <div className="text-xs text-slate-500">Chưa hoàn thành</div>
            )}
          </div>
        </div>
      </div>

      {/* Action button */}
      <div className="mt-4 pt-4 border-t border-slate-100">
        {hasCompleted ? (
          <Link to={`/quizzes/${quiz._id}/result`}>
            <button className="w-full inline-flex items-center justify-center gap-2 h-11 px-4 bg-linear-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-emerald-500/25 hover:from-emerald-600 hover:to-teal-600 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-200">
              <BarChart2 className="w-4 h-4" strokeWidth={2.5} />
              Xem kết quả
            </button>
          </Link>
        ) : (
          <Link to={`/quizzes/${quiz._id}`}>
            <button className="w-full inline-flex items-center justify-center gap-2 h-11 px-4 bg-linear-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-emerald-500/25 hover:from-emerald-600 hover:to-teal-600 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-200">
              <Play className="w-4 h-4" strokeWidth={2.5} />
              Bắt đầu
            </button>
          </Link>
        )}
      </div>

      {/* Hover indicator */}
      <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-emerald-500/0 to-teal-500/0 group-hover:from-emerald-500/5 group-hover:to-teal-500/5 transition-all duration-300 pointer-events-none"></div>
    </div>
  );
};

export default QuizCard;
