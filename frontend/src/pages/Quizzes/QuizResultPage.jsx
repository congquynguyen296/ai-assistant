import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import {
  CheckCircle,
  XCircle,
  ArrowLeft,
  RotateCcw,
  Award,
  BookOpen,
} from "lucide-react";
import quizService from "../../services/quizService";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const QuizResultPage = () => {
  const { quizId } = useParams();
  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await quizService.getQuizResults(quizId);
        setResultData(response?.data);
      } catch (error) {
        console.error(`Error fetching results: ${error}`);
        toast.error("Không thể lấy kết quả bài thi");
      } finally {
        setLoading(false);
      }
    };

    if (quizId) {
      fetchResults();
    }
  }, [quizId]);

  if (loading) return <LoadingSpinner />;
  if (!resultData) return null;

  const { quiz, results } = resultData;
  const percentage = Math.round(quiz.score || 0);

  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-600 border-emerald-200 bg-emerald-50";
    if (score >= 50) return "text-amber-600 border-amber-200 bg-amber-50";
    return "text-red-600 border-red-200 bg-red-50";
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/documents"
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Về danh sách tài liệu
        </Link>

        <Link to={`/quizzes/${quizId}`}>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-all shadow-sm text-sm">
            <RotateCcw className="w-4 h-4" />
            Làm lại
          </button>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8 text-center">
        <div className="inline-flex items-center justify-center p-3 rounded-full bg-emerald-100 mb-4">
          <Award className="w-8 h-8 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-emerald-900 mb-2">
          Kết quả bài làm
        </h1>
        <p className="text-slate-500 mb-8">{quiz.title}</p>

        {/* Rearranged Score Section */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-8">
          {/* Left: Correct Answers */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 min-w-[140px]">
            <p className="text-xs text-slate-500 font-medium uppercase mb-1">
              Câu đúng
            </p>
            <p className="text-xl font-bold text-emerald-600">
              {results.filter((r) => r.isCorrect).length}{" "}
              <span className="text-sm text-slate-400 font-normal">
                / {results.length}
              </span>
            </p>
          </div>

          {/* Center: Score Circle */}
          <div
            className={`flex flex-col items-center justify-center w-36 h-36 rounded-full border-4 ${getScoreColor(
              percentage
            )}`}
          >
            <span className="text-3xl font-bold">{percentage}%</span>
            <span className="text-xs font-semibold uppercase opacity-80">
              Điểm số
            </span>
          </div>

          {/* Right: Status */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 min-w-[140px]">
            <p className="text-xs text-slate-500 font-medium uppercase mb-1">
              Trạng thái
            </p>
            <p
              className={`text-xl font-bold ${
                percentage >= 50 ? "text-emerald-600" : "text-amber-600"
              }`}
            >
              {percentage >= 50 ? "Đạt" : "Chưa đạt"}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-slate-700" />
          <h2 className="text-lg font-bold text-slate-800">Chi tiết câu hỏi</h2>
        </div>

        {results.map((item, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 flex items-start gap-4">
              <div
                className={`mt-1 w-6 h-6 rounded-full shrink-0 flex items-center justify-center border 
                        ${
                          item.isCorrect
                            ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                            : "bg-red-50 border-red-200 text-red-600"
                        }`}
              >
                {item.isCorrect ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Câu {idx + 1}
                </span>
                <h3 className="text-base font-medium text-slate-900 mt-1 mb-2 leading-relaxed">
                  {item.question}
                </h3>

                {!item.isCorrect && (
                  <div className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-1.5 rounded-md inline-flex items-center gap-2">
                    <XCircle className="w-4 h-4" />
                    Gần đúng rồi, cố lên.
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 bg-slate-50/50">
              <div className="grid gap-3">
                {item.options.map((option, optIdx) => {
                  const isSelected = option === item.selectedAnswer;
                  const isCorrect = option === item.correctAnswer;

                  let styleClass = "border-slate-200 bg-white text-slate-700";
                  let icon = null;

                  if (isCorrect) {
                    styleClass =
                      "border-emerald-500 bg-emerald-50 text-emerald-900 font-medium";
                    icon = <CheckCircle className="w-5 h-5 text-emerald-600" />;
                  } else if (isSelected && !isCorrect) {
                    styleClass = "border-red-300 bg-red-50 text-red-900";
                    icon = <XCircle className="w-5 h-5 text-red-600" />;
                  }

                  return (
                    <div
                      key={optIdx}
                      className={`p-3 rounded-lg border flex items-start gap-3 text-sm ${styleClass}`}
                    >
                      <span className="flex-1 leading-relaxed">{option}</span>
                      {icon}
                    </div>
                  );
                })}
              </div>

              {item.explaintion && (
                <div className="mt-4 p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
                  <h4 className="text-sm font-bold text-indigo-900 mb-1">
                    Giải thích:
                  </h4>
                  <p className="text-sm text-indigo-800 leading-relaxed">
                    {item.explaintion}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizResultPage;
