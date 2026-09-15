import { useEffect, useState } from "react";
import { toast } from "sonner";
import flashcardService from "@/services/flashcardService";
import aiService from "@/services/aiService";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { Brain, Sparkles, Trash2, Plus, MoreVertical } from "lucide-react";
import moment from "moment";
import ConfirmModal from "@/components/common/ConfirmModal";
import GenerateModal from "@/components/common/GenerateModal";
import Flashcard from "@/components/flashcards/Flashcard";
import FlashcardSetEditor from "@/components/flashcards/FlashcardSetEditor";
import RenameModal from "@/components/common/RenameModal";
import type { FlashcardSet } from "@/types/models";

interface FlashcardManagerProps {
  documentId: string;
}

const FlashcardManager = ({ documentId }: FlashcardManagerProps) => {
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [selectedSet, setSelectedSet] = useState<FlashcardSet | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [editingSet, setEditingSet] = useState<FlashcardSet | null>(null);
  
  // States for Review Mode
  const [reviewCards, setReviewCards] = useState<any[] | null>(null);
  const [loadingReview, setLoadingReview] = useState(false);
  
  // States for renaming
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [setToRename, setSetToRename] = useState<FlashcardSet | null>(null);
  const [renaming, setRenaming] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [setToDelete, setSetToDelete] = useState<FlashcardSet | null>(null);

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
      fetchFlashcardSets();
    }
  }, [documentId]);

  // Function to generate flashcard
  const handleGenerateFlashcards = async ({ count, title, requirements }: { count: number; title: string; requirements: string }) => {
    setGenerating(true);
    try {
      // Gọi service với các tham số mới: numFlashcards, title, requirements
      await aiService.generateFlashcards(documentId, {
        numFlashcards: count,
        title,
        requirements,
      });
      toast.success("Tạo flashcards thành công");
      setIsGenerateModalOpen(false);
      fetchFlashcardSets();
    } catch (error) {
      console.log(`Có lỗi xảy ra khi tạo flashcards: ${error}`);
      toast.error("Có lỗi xảy ra khi tạo fashcards");
    } finally {
      setGenerating(false);
    }
  };

  // Handle update flashcard set after changes (review, star)
  const handleUpdateSet = (updatedSet: FlashcardSet) => {
    const updatedSets = flashcardSets.map((set) =>
      set._id === updatedSet._id ? updatedSet : set
    );
    setFlashcardSets(updatedSets);
    
    // Only update selectedSet if we are currently viewing it
    if (selectedSet && selectedSet._id === updatedSet._id) {
      setSelectedSet(updatedSet);
    }
  };

  // Func to handle delete request
  const handleDeleteRequest = (e: React.MouseEvent, flashcardSet: FlashcardSet) => {
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

  // Handle confirm rename
  const handleConfirmRename = async (newTitle: string) => {
    if (!setToRename || !newTitle.trim()) return;

    setRenaming(true);
    try {
      await flashcardService.renameFlashcardSet(setToRename._id, newTitle.trim());
      toast.success("Đổi tên bộ flashcard thành công");
      setIsRenameModalOpen(false);
      setSetToRename(null);
      fetchFlashcardSets();
    } catch (error: any) {
      toast.error(error.message || "Đổi tên thất bại");
    } finally {
      setRenaming(false);
    }
  };

  // Func handle selected set (Browse mode)
  const handleSelectFlashcardSet = (flashcardSet: FlashcardSet) => {
    setSelectedSet(flashcardSet);
  };

  // Handle start review (Review mode)
  const handleStartReview = async () => {
    setLoadingReview(true);
    try {
      const response = await flashcardService.getReviewSession(documentId);
      const cards = response.data || [];
      if (cards.length === 0) {
        toast.info("Không có thẻ nào cần ôn tập hôm nay!");
      } else {
        setReviewCards(cards);
      }
    } catch (error) {
      console.log(`Lỗi khi lấy session: ${error}`);
      toast.error("Có lỗi xảy ra khi lấy danh sách ôn tập");
    } finally {
      setLoadingReview(false);
    }
  };

  // Handle back to list
  const handleBackToList = () => {
    setSelectedSet(null);
    setEditingSet(null);
    setReviewCards(null);
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
                Tạo flashcard
              </>
            )}
          </button>
        </div>
      );
    }

    if (editingSet) {
      return (
        <FlashcardSetEditor
          flashcardSet={editingSet}
          onBack={handleBackToList}
          onSetUpdated={(updatedSet) => {
            setEditingSet(updatedSet);
            handleUpdateSet(updatedSet);
          }}
        />
      );
    }

    return (
      <div className="space-y-6">
        {/* Header generate button */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div className="w-full md:w-auto">
            <h3 className="text-2xl font-bold text-slate-900">
              Flashcards
            </h3>
            <p className="text-md font-medium text-slate-500 mt-1">
              {flashcardSets.length} bộ thẻ trong tài liệu này
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <button
              onClick={handleStartReview}
              disabled={loadingReview}
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 whitespace-nowrap bg-linear-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25 hover:from-blue-600 hover:to-indigo-600 hover:shadow-xl hover:shadow-blue-500/30"
            >
              {loadingReview ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Brain className="w-5 h-5 text-white" strokeWidth={2.5} />
              )}
              Bắt đầu ôn tập
            </button>
            <button
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 whitespace-nowrap bg-linear-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-600 hover:to-teal-600 hover:shadow-xl hover:shadow-emerald-500/30"
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
        </div>

        {/* Flashcard set grids */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {flashcardSets.map((set) => (
            <div
              className="group relative bg-white/80 backdrop-blur-xl border-2 border-slate-200 hover:border-emerald-300 rounded-2xl p-6 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/10 flex flex-col justify-between"
              key={set._id}
              onClick={() => handleSelectFlashcardSet(set)}
            >
              {/* Dropdown Menu */}
              <div className="absolute top-4 right-4 z-20">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDropdown(activeDropdown === set._id ? null : set._id);
                  }}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 cursor-pointer ${
                    activeDropdown === set._id 
                      ? "text-emerald-600 bg-emerald-50 opacity-100" 
                      : "text-slate-400 opacity-100 md:opacity-0 group-hover:opacity-100 hover:text-emerald-600 hover:bg-emerald-50"
                  }`}
                >
                  <MoreVertical className="w-5 h-5" strokeWidth={2} />
                </button>
                {activeDropdown === set._id && (
                  <div className="absolute right-0 mt-1 w-36 bg-white border border-slate-200 rounded-xl shadow-lg shadow-slate-900/10 overflow-hidden py-1 z-30">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDropdown(null);
                        setSetToRename(set);
                        setIsRenameModalOpen(true);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Đổi tên
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDropdown(null);
                        setEditingSet(set);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Cập nhật
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDropdown(null);
                        toast.info("Tính năng đang trong giai đoạn phát triển");
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Chia sẻ
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDropdown(null);
                        handleDeleteRequest(e, set);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Xóa
                    </button>
                  </div>
                )}
              </div>

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
                    {set.title || "Bộ flashcard không tiêu đề"}
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
        {reviewCards ? (
          // Render SRS Review
          <Flashcard
            cards={reviewCards}
            isReviewMode={true}
            onBack={handleBackToList}
            onUpdateCards={(updatedCards) => {
              setReviewCards(updatedCards);
            }}
          />
        ) : selectedSet ? (
          // Render Browse flashcard set
          <Flashcard
            cards={selectedSet.cards}
            isReviewMode={false}
            onBack={handleBackToList}
            onUpdateCards={(updatedCards) => {
              const newSet = { ...selectedSet, cards: updatedCards };
              handleUpdateSet(newSet as FlashcardSet);
            }}
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

      {/* Generate flashcard modal */}
      <GenerateModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        onGenerate={handleGenerateFlashcards}
        loading={generating}
        title="Tạo flashcard mới"
        description="Nhập số lượng thẻ và các yêu cầu khác (nếu có)"
        countLabel="Số lượng thẻ"
        defaultCount={10}
        maxCount={30}
      />

      {/* Rename modal */}
      <RenameModal
        isOpen={isRenameModalOpen}
        onClose={() => {
          setIsRenameModalOpen(false);
          setSetToRename(null);
        }}
        onConfirm={handleConfirmRename}
        title="Đổi tên bộ Flashcard"
        description="Nhập tên mới cho bộ flashcard của bạn"
        initialValue={setToRename?.title || ""}
        isLoading={renaming}
      />
    </div>
  );
};

export default FlashcardManager;
