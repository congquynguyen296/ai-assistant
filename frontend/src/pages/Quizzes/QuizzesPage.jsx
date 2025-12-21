import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  BrainCircuit,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import quizService from "../../services/quizService";
import PageHeader from "../../components/common/PageHeader";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Button from "../../components/common/Button";
import QuizCard from "../../components/quizzes/QuizCard";
import ConfirmModal from "../../components/common/ConfirmModal";

const PAGE_SIZE = 9;

const QuizzesPage = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchQuizzes();
  }, [currentPage]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await quizService.getQuizzes(currentPage, PAGE_SIZE);
      if (response.success) {
        setQuizzes(response.data.quizzes || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      toast.error("Không thể tải danh sách quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuiz = async () => {
    if (!selectedQuiz) return;

    try {
      setDeleting(true);
      await quizService.deleteQuiz(selectedQuiz._id);
      setQuizzes((prev) => prev.filter((q) => q._id !== selectedQuiz._id));
      toast.success("Xóa quiz thành công");
      setIsDeleteModalOpen(false);
      // Refresh if page becomes empty and not on first page
      if (quizzes.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else {
        fetchQuizzes();
      }
    } catch (error) {
      console.error("Error deleting quiz:", error);
      toast.error("Xóa quiz thất bại");
    } finally {
      setDeleting(false);
      setSelectedQuiz(null);
    }
  };

  const filteredQuizzes = quizzes.filter((quiz) =>
    quiz.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <PageHeader
        title="Thư viện câu hỏi"
        description="Quản lý và ôn tập các bộ câu hỏi trắc nghiệm của bạn"
        icon={BrainCircuit}
        action={
          <Button onClick={() => navigate("/documents")}>
            <Plus className="w-5 h-5 mr-2" />
            Tạo Quiz mới
          </Button>
        }
      />

      {/* Search and Filter */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm quiz..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>
      </div>

      {/* Quiz Grid */}
      {filteredQuizzes.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredQuizzes.map((quiz) => (
              <QuizCard
                key={quiz._id}
                quiz={quiz}
                onDelete={(quiz) => {
                  setSelectedQuiz(quiz);
                  setIsDeleteModalOpen(true);
                }}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === page
                          ? "bg-emerald-600 text-white"
                          : "text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-200"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
            <BrainCircuit className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Chưa có bộ câu hỏi nào
          </h3>
          <p className="text-slate-500 max-w-md mx-auto mb-6">
            Tạo bộ câu hỏi đầu tiên từ tài liệu của bạn để bắt đầu ôn tập hiệu
            quả hơn.
          </p>
          <Button onClick={() => navigate("/documents")}>Tạo Quiz ngay</Button>
        </div>
      )}

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteQuiz}
        title="Xóa bộ câu hỏi"
        message={`Bạn có chắc chắn muốn xóa quiz "${selectedQuiz?.title}" không? Hành động này không thể hoàn tác.`}
        confirmText="Xóa Quiz"
        isLoading={deleting}
        variant="danger"
      />
    </div>
  );
};

export default QuizzesPage;
