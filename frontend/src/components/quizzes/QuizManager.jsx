import { useEffect, useState } from "react";
import { toast } from "sonner";
import quizService from "../../services/quizService";
import aiService from "../../services/aiService";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import QuizCard from "./QuizCard";
import ConfirmModal from "../common/ConfirmModal";
import { Plus, Sparkles, HelpCircle, Trash2, X } from "lucide-react";

const QuizManager = ({ documentId }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [numQuestion, setNumQuestion] = useState(5);

  // Fetch quizzes function
  const fetchQuizzes = async (documentId) => {
    setLoading(true);

    try {
      const response = await quizService.getQuizzesForDocument(documentId);
      setQuizzes(response?.data || []);
    } catch (error) {
      console.error(`Có lỗi xảy ra khi lấy danh sách quiz: ${error}`);
      toast.error("Lấy danh sách quiz không thành công");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (documentId) {
      fetchQuizzes(documentId);
    }
  }, [documentId]);

  // Handle generate quiz
  const handleGenerateQuiz = async (e) => {
    e.preventDefault();

    if (numQuestion < 1 || numQuestion > 20) {
      toast.error("Số lượng câu hỏi phải từ 1 đến 20");
      return;
    }

    setGenerating(true);

    try {
      await aiService.generateQuiz(documentId, { numQuestion });
      toast.success("Tạo quiz thành công");
      setIsGenerateModalOpen(false);
      setNumQuestion(5);
      fetchQuizzes(documentId);
    } catch (error) {
      console.error(`Có lỗi xảy ra khi generate quiz: ${error}`);
      toast.error("Có lỗi xảy ra khi generate quiz");
    } finally {
      setGenerating(false);
    }
  };

  // Delete request func
  const handleDeleteRequest = (quiz) => {
    setSelectedQuiz(quiz);
    setIsDeleteModalOpen(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (!selectedQuiz) return;
    setDeleting(true);

    try {
      await quizService.deleteQuiz(selectedQuiz._id);
      toast.success(`Quiz "${selectedQuiz.title}" đã được xóa`);
      setIsDeleteModalOpen(false);
      setSelectedQuiz(null);
      fetchQuizzes(documentId);
    } catch (error) {
      console.error(`Có lỗi xảy ra khi xóa quiz: ${error}`);
      toast.error("Có lỗi xảy ra khi xóa quiz");
    } finally {
      setDeleting(false);
    }
  };

  // Render content quiz of document
  const renderQuizContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-28">
          <LoadingSpinner />
        </div>
      );
    }

    if (quizzes.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-emerald-100 to-teal-100 mb-2">
            <HelpCircle className="h-8 w-8 text-emerald-600" strokeWidth={2} />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            Chưa có quiz nào
          </h3>
          <p className="text-sm text-slate-500 mb-8 text-center max-w-sm">
            Tạo quiz của bạn ngay bây giờ để kiểm tra kiến thức đối với tài liệu
          </p>
          <button
            onClick={() => setIsGenerateModalOpen(true)}
            disabled={generating}
            className="inline-flex items-center justify-center gap-2 px-6 h-12 font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 whitespace-nowrap bg-linear-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-600 hover:to-teal-600 hover:shadow-xl hover:shadow-emerald-500/30"
          >
            {generating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Đang tạo...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" strokeWidth={2} />
                Tạo quiz
              </>
            )}
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Danh sách quizzes
            </h3>
            <p className="text-md font-medium text-slate-500 mt-1">
              {quizzes.length} bài quiz
            </p>
          </div>

          <div>{/* Placeholder for alignment */}</div>

          <button
            className="inline-flex items-center justify-center gap-2 px-6 h-12 font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 whitespace-nowrap bg-linear-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-600 hover:to-teal-600 hover:shadow-xl hover:shadow-emerald-500/30"
            onClick={() => setIsGenerateModalOpen(true)}
            disabled={generating}
          >
            {generating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Đang tạo...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 text-white" strokeWidth={2.5} />
                Thêm mới
              </>
            )}
          </button>
        </div>

        {/* Quiz grids */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizzes.map((quiz) => (
            <QuizCard
              key={quiz._id}
              quiz={quiz}
              onDelete={handleDeleteRequest}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-200/50 p-8">
        {renderQuizContent()}
      </div>

      {/* Delete confirm modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedQuiz(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa"
        message={
          selectedQuiz
            ? `Bạn có chắc muốn xóa quiz "${selectedQuiz.title}"? Hành động này không thể hoàn tác sau khi được xác nhận.`
            : "Bạn có chắc muốn xóa quiz này?"
        }
        confirmText="Xóa"
        cancelText="Hủy"
        isLoading={deleting}
        icon={Trash2}
        variant="danger"
      />

      {/* Generate quiz modal */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white/95 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-lg shadow-slate-900/20 p-6">
            {/* Close button */}
            <button
              className="absolute top-6 right-6 h-8 w-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200"
              onClick={() => {
                setIsGenerateModalOpen(false);
                setNumQuestion(5);
              }}
              disabled={generating}
            >
              <X className="w-5 h-5" strokeWidth={2} />
            </button>

            {/* Modal header */}
            <div className="mb-6">
              <div className="w-12 h-12 rounded-xl bg-linear-to-r from-emerald-100 to-teal-100 flex items-center justify-center mb-3">
                <Sparkles
                  className="w-6 h-6 text-emerald-600"
                  strokeWidth={2}
                />
              </div>
              <h2 className="text-xl font-medium text-slate-900 tracking-tight">
                Tạo quiz mới
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Nhập số lượng câu hỏi bạn muốn tạo (1-20)
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleGenerateQuiz} className="space-y-6">
              {/* Input field */}
              <div>
                <label
                  htmlFor="numQuestion"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Số lượng câu hỏi
                </label>
                <input
                  type="number"
                  id="numQuestion"
                  min="1"
                  max="20"
                  value={numQuestion}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value) && value >= 1 && value <= 20) {
                      setNumQuestion(value);
                    } else if (e.target.value === "") {
                      setNumQuestion("");
                    }
                  }}
                  className="w-full h-11 px-4 border-2 border-slate-200 rounded-xl bg-white text-slate-900 text-sm font-medium focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                  placeholder="Nhập số lượng câu hỏi"
                  required
                  disabled={generating}
                />
                <p className="text-xs text-slate-500 mt-2">
                  Số lượng câu hỏi tối thiểu: 1, tối đa: 20
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsGenerateModalOpen(false);
                    setNumQuestion(5);
                  }}
                  disabled={generating}
                  className="flex-1 h-11 px-4 border-2 border-slate-200 rounded-xl bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={
                    generating ||
                    !numQuestion ||
                    numQuestion < 1 ||
                    numQuestion > 20
                  }
                  className="flex-1 h-11 px-4 bg-linear-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-emerald-500/25 hover:from-emerald-600 hover:to-teal-600 hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generating ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Đang tạo...
                    </span>
                  ) : (
                    "Tạo quiz"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizManager;
