import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  CheckCircle,
  Timer,
  AlertTriangle,
} from "lucide-react";
import quizService from "../../services/quizService";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ConfirmModal from "../../components/common/ConfirmModal";

// Clean Modal without glassmorphism
const StartQuizModal = ({ isOpen, onClose, onStart }) => {
  const [duration, setDuration] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-emerald-50 rounded-full mb-4 mx-auto">
            <Timer className="w-6 h-6 text-emerald-600" />
          </div>
          <h3 className="text-xl font-bold text-center text-slate-900 mb-2">
            Bắt đầu làm bài
          </h3>
          <p className="text-center text-slate-500 mb-6 text-sm">
            Bạn có thể thiết lập thời gian làm bài (tùy chọn).
          </p>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Thời gian (phút)
            </label>
            <input
              type="number"
              min="1"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="Để trống nếu không giới hạn"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-slate-50 text-slate-700 font-medium hover:bg-slate-100 rounded-lg transition-all text-sm"
            >
              Quay lại
            </button>
            <button
              onClick={() => onStart(duration ? parseInt(duration) * 60 : null)}
              className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-sm transition-all text-sm"
            >
              Bắt đầu ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const QuizTakePage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // State for answers
  const [selectedAnswers, setSelectedAnswers] = useState({});
  // Ref for answers to access latest state in timer closure
  const selectedAnswersRef = useRef({});

  const [showStartModal, setShowStartModal] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [showConfirmFinish, setShowConfirmFinish] = useState(false);

  const timerRef = useRef(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!quizId) {
        toast.error("Không tìm thấy ID bài kiểm tra");
        return;
      }
      try {
        const response = await quizService.getQuizById(quizId);
        setQuiz(response?.data);
      } catch (error) {
        console.error(`Error fetching quiz: ${error}`);
        toast.error("Không thể tải đề bài");
        navigate("/documents");
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [quizId, navigate]);

  // Handle auto-finish logic using Refs to get latest state
  const finishQuiz = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    // Use the Ref here to guarantee latest answers
    navigate(`/quizzes/${quizId}/review`, {
      state: {
        quiz,
        answers: selectedAnswersRef.current,
        timeLeft,
      },
      replace: true, // Replace history to prevent going back
    });
  }, [navigate, quizId, quiz, timeLeft]);

  const handleStartQuiz = (durationInSeconds) => {
    setShowStartModal(false);
    setIsStarted(true);

    if (durationInSeconds) {
      setTimeLeft(durationInSeconds);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            // Trigger finish directly from the interval callback to ensure execution
            // We need to call finishQuiz() but be careful about scope
            // However, finishQuiz depends on 'quiz' and 'timeLeft' which are state/props.
            // Using a ref for the finish function is a common trick if dependencies change often,
            // but here we can just detect the 0 state in a useEffect or handle it here.
            // Since we rely on 'selectedAnswersRef', we can execute logic here or trigger an effect.
            // Let's trigger via the callback:
            finishQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  useEffect(() => {
    if (!loading && quiz && !isStarted) {
      setShowStartModal(true);
    }
  }, [loading, quiz, isStarted]);

  // Keep ref in sync
  useEffect(() => {
    selectedAnswersRef.current = selectedAnswers;
  }, [selectedAnswers]);

  const handleAnswerSelect = (answer) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: answer,
    }));
  };

  const formatTime = (seconds) => {
    if (seconds === null) return "∞";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const progress = quiz
    ? ((currentQuestionIndex + 1) / quiz.questions.length) * 100
    : 0;
  const answeredCount = Object.keys(selectedAnswers).length;

  if (loading) return <LoadingSpinner />;
  if (!quiz) return null;

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <StartQuizModal
        isOpen={showStartModal}
        onClose={() => navigate(-1)}
        onStart={handleStartQuiz}
      />

      <ConfirmModal
        isOpen={showConfirmFinish}
        onClose={() => setShowConfirmFinish(false)}
        onConfirm={finishQuiz}
        title="Xác nhận nộp bài"
        message="Bạn có muốn kết thúc bài làm và chuyển sang trang xem lại? Bạn sẽ không thể quay lại trang này để làm tiếp."
        confirmText="Đồng ý"
        cancelText="Hủy"
        icon={AlertTriangle}
        variant="warning"
      />

      {/* Header Info */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-6 flex items-center justify-between sticky top-4 z-20">
        <div className="flex-1 mr-4">
          <h1
            className="text-lg font-bold text-slate-800 line-clamp-1"
            title={quiz.title}
          >
            {quiz.title}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-full max-w-[200px] h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
              {answeredCount}/{quiz.questions.length} câu
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
              timeLeft !== null && timeLeft < 60
                ? "bg-red-50 border-red-200 text-red-600"
                : "bg-slate-50 border-slate-200 text-slate-700"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span className="font-mono font-bold text-base">
              {formatTime(timeLeft)}
            </span>
          </div>

          <button
            onClick={() => setShowConfirmFinish(true)}
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors shadow-sm text-sm"
          >
            <CheckCircle className="w-4 h-4" />
            Nộp bài
          </button>
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm min-h-[400px] flex flex-col">
        <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/30">
          <div className="flex items-center justify-between mb-4">
            <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
              Câu hỏi {currentQuestionIndex + 1}
            </span>
          </div>
          <h2 className="text-xl font-medium text-slate-900 leading-relaxed">
            {currentQuestion.question}
          </h2>
        </div>

        <div className="p-6 md:p-8 flex-1">
          <div className="grid gap-3">
            {currentQuestion.options.map((option, idx) => {
              const isSelected =
                selectedAnswers[currentQuestionIndex] === option;
              return (
                <button
                  key={idx}
                  onClick={() => handleAnswerSelect(option)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-start gap-4 hover:shadow-sm
                                ${
                                  isSelected
                                    ? "border-emerald-500 bg-emerald-50/50"
                                    : "border-slate-100 hover:border-emerald-300 hover:bg-slate-50"
                                }
                            `}
                >
                  <div
                    className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors
                                ${
                                  isSelected
                                    ? "border-emerald-500 bg-emerald-500 text-white"
                                    : "border-slate-300 group-hover:border-emerald-300"
                                }
                            `}
                  >
                    {isSelected && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <span
                    className={`text-base leading-relaxed ${
                      isSelected
                        ? "text-emerald-900 font-medium"
                        : "text-slate-700"
                    }`}
                  >
                    {option}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Nav */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-xl flex items-center justify-between">
          <button
            onClick={() =>
              setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
            }
            disabled={currentQuestionIndex === 0}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 font-medium hover:bg-white hover:text-slate-900 hover:shadow-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Trước
          </button>

          {currentQuestionIndex === quiz.questions.length - 1 ? (
            <button
              onClick={() => setShowConfirmFinish(true)}
              className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-sm transition-all text-sm"
            >
              Review & Nộp
              <CheckCircle className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() =>
                setCurrentQuestionIndex((prev) =>
                  Math.min(quiz.questions.length - 1, prev + 1)
                )
              }
              className="flex items-center gap-2 px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-lg shadow-sm transition-all text-sm"
            >
              Tiếp theo
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizTakePage;
