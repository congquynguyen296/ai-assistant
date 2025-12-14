import { useEffect, useState } from "react";
import { toast } from "sonner";
import flashcardService from "../../services/flashcardService";
import aiService from "../../services/aiService";
import LoadingSpinner from "../common/LoadingSpinner";
import { Brain, Sparkles, Trash2, Plus } from "lucide-react";
import moment from "moment";
import ConfirmModal from "../common/ConfirmModal";
import Flashcard from "./Flashcard";

const FlashcardManager = ({ documentId }) => {
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [selectedSet, setSelectedSet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [setToDelete, setSetToDelete] = useState(null);

  // Fetch all flashcard of document function
  const fetchFlashcardSets = async () => {
    setLoading(true);

    try {
      const response = await flashcardService.getAllFlashcardsForDocument(
        documentId
      );
      setFlashcardSets(response?.data);
    } catch (error) {
      console.log(`Có lỗi xảy ra khi tải danh sách flashcard: ${error}`);
      toast.error("Có lỗi xảy ra khi tải danh sách flashcard");
    } finally {
      setLoading(false);
    }
  };

  // Fetch flashcard sets
  useEffect(() => {
    if (documentId) {
      fetchFlashcardSets(documentId);
    }
  }, [documentId]);

  // Function to generate flashcard
  const handleGenerateFlashcards = async () => {
    setGenerating(true);
    await aiService.generateFlashcards(documentId);
    toast.success("Tạo flashcards thành công");
    fetchFlashcardSets();
    try {
    } catch (error) {
      console.log(`Có lỗi xảy ra khi tạo flashcards: ${error}`);
      toast.error("Có lỗi xảy ra khi tạo fashcards");
    } finally {
      setGenerating(false);
    }
  };

  // Handle update flashcard set after changes (review, star)
  const handleUpdateSet = (updatedSet) => {
    const updatedSets = flashcardSets.map((set) =>
      set._id === updatedSet._id ? updatedSet : set
    );
    setFlashcardSets(updatedSets);
    setSelectedSet(updatedSet);
  };

  // Func to handle delete request
  const handleDeleteRequest = (e, flashcardSet) => {
    e.stopPropagation();
    setSetToDelete(flashcardSet);
    setIsDeleteModalOpen(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (!setToDelete) return;
    setDeleting(true);

    try {
      await flashcardService.deleteFlashcardSet(setToDelete._id);
      toast.success("Flashcard được xóa thành công");
      setIsDeleteModalOpen(false);
      setSetToDelete(null);
      fetchFlashcardSets();
    } catch (error) {
      console.log(`Có lỗi xảy ra khi xóa flashcard: ${error}`);
      toast.error("Có lỗi xảy ra khi xóa flashcard");
    } finally {
      setDeleting(false);
    }
  };

  // Func handle selected set
  const handleSelectFlashcardSet = (flashcardSet) => {
    setSelectedSet(flashcardSet);
  };

  // Handle back to list
  const handleBackToList = () => {
    setSelectedSet(null);
  };

  const renderSetList = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-28">
          <LoadingSpinner />
        </div>
      );
    }

    if (flashcardSets.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-emerald-100 to-teal-100 mb-2">
            <Brain className="h-8 w-8 text-emerald-600" strokeWidth={2} />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            Chưa có flashcard nào
          </h3>
          <p className="text-sm text-slate-500 mb-8 text-center max-w-sm">
            Tạo flashcard của bạn ngay bây giờ để tìm hiểu về tài liệu
          </p>
          <button
            onClick={handleGenerateFlashcards}
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
                Tạo flashcard
              </>
            )}
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Header generate button */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Danh sách flashcards
            </h3>
            <p className="text-md font-medium text-slate-500 mt-1">
              {flashcardSets.length} bộ
            </p>
          </div>

          <div className="">{/* Placeholder for alignment */}</div>

          <button
            className="inline-flex items-center justify-center gap-2 px-6 h-12 font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 whitespace-nowrap bg-linear-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-600 hover:to-teal-600 hover:shadow-xl hover:shadow-emerald-500/30"
            onClick={handleGenerateFlashcards}
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

        {/* Flashcard set grids */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {flashcardSets.map((set) => (
            <div
              className="group relative bg-white/80 backdrop-blur-xl border-2 border-slate-200 hover:border-emerald-300 rounded-2xl p-6 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/10 flex flex-col justify-between"
              key={set._id}
              onClick={() => handleSelectFlashcardSet(set)}
            >
              {/* Delete button */}
              <button
                onClick={(e) => handleDeleteRequest(e, set)}
                title="Xóa flashcard"
                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 cursor-pointer z-10"
              >
                <Trash2 className="w-5 h-5" strokeWidth={2} />
              </button>

              {/* Header section */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-linear-to-br from-emerald-100 to-teal-100">
                    <Brain
                      className="w-6 h-6 text-emerald-600"
                      strokeWidth={2}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-base font-semibold text-slate-900 mb-2">
                    Bộ flashcard
                  </h4>
                  <p className="text-xs font-medium text-slate-500">
                    Đã tạo {moment(set.createAt).format("MMM D, YYYY")}
                  </p>
                </div>
              </div>

              {/* Footer section */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between gap-2">
                  <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <span className="text-sm font-semibold text-emerald-700">
                      {set.cards.length} thẻ
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">Click để xem</div>
                </div>
              </div>

              {/* Hover indicator */}
              <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-emerald-500/0 to-teal-500/0 group-hover:from-emerald-500/5 group-hover:to-teal-500/5 transition-all duration-300 pointer-events-none"></div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-200/50 p-8">
        {selectedSet ? (
          // Render flashcard
          <Flashcard
            flashcardSet={selectedSet}
            onBack={handleBackToList}
            onUpdateSet={handleUpdateSet}
          />
        ) : (
          renderSetList()
        )}
      </div>
      {/* Delete confirm modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa"
        message="Bạn có chắc muốn xóa bộ flashcard này? Hành động này không thể hoàn tác sau khi được xác nhận."
        confirmText="Xóa"
        cancelText="Hủy"
        isLoading={deleting}
        icon={Trash2}
        variant="danger"
      />
    </div>
  );
};

export default FlashcardManager;
