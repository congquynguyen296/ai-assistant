import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { CheckCircle, AlertCircle, HelpCircle } from "lucide-react";
import quizService from "../../services/quizService";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const QuizReviewPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If no state (user accessed directly), redirect back
  if (!state?.quiz) {
    navigate("/quizzes");
    return null;
  }

  const { quiz, answers } = state;
  const answeredCount = Object.keys(answers).length;
  const totalQuestions = quiz.questions.length;
  const notAnsweredCount = totalQuestions - answeredCount;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const formattedAnswers = Object.entries(answers).map(([key, value]) => ({
        questionIndex: parseInt(key),
        selectedAnswer: value,
      }));

      await quizService.submitQuiz(quiz._id || quiz.quizId, formattedAnswers);

      toast.success("Nộp bài thành công!");
      navigate(`/quizzes/${quiz._id || quiz.quizId}/result`, { replace: true });
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Có lỗi xảy ra khi nộp bài");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        {/* Removed Back Button as requested by user to prevent state loss */}
        <h1 className="text-2xl font-bold text-slate-900">Xem lại bài làm</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Overview Card */}
        <div className="col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-4">Tổng quan</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-md">
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-5 h-5 text-indigo-600" />
                  <span className="text-sm font-medium text-slate-700">
                    Tổng câu hỏi
                  </span>
                </div>
                <span className="font-bold text-slate-900">
                  {totalQuestions}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-md">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm font-medium text-slate-700">
                    Đã làm
                  </span>
                </div>
                <span className="font-bold text-emerald-600">
                  {answeredCount}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-md">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  <span className="text-sm font-medium text-slate-700">
                    Chưa làm
                  </span>
                </div>
                <span className="font-bold text-amber-600">
                  {notAnsweredCount}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full h-12 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md shadow-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <LoadingSpinner size="sm" variant="inline" message="" />
                ) : (
                  <>
                    Nộp bài ngay
                    <CheckCircle className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Question Grid */}
        <div className="col-span-1 md:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-6">
              Chi tiết câu trả lời
            </h3>

            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-3">
              {quiz.questions.map((q, idx) => {
                const isAnswered = answers[idx] !== undefined;
                return (
                  <button
                    key={idx}
                    disabled={true} // Review only, cannot navigate back
                    className={`aspect-square rounded-md flex flex-col items-center justify-center border transition-all
                                    ${
                                      isAnswered
                                        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                        : "bg-slate-50 border-slate-200 text-slate-400"
                                    }
                                `}
                  >
                    <span className="text-sm font-bold">{idx + 1}</span>
                    {isAnswered && <CheckCircle className="w-3 h-3 mt-1" />}
                  </button>
                );
              })}
            </div>

            <div className="mt-8 flex items-center gap-6 text-sm border-t border-slate-100 pt-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-emerald-50 border border-emerald-200 rounded"></div>
                <span className="text-slate-600">Đã trả lời</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-slate-50 border border-slate-200 rounded"></div>
                <span className="text-slate-600">Chưa trả lời</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizReviewPage;
