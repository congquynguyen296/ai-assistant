import React, { useState, useRef } from "react";
import { ArrowLeft, Plus, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { FlashcardSet } from "@/types/models";
import { Difficulty } from "@/types/enums";
import flashcardService from "@/services/flashcardService";
import ConfirmModal from "@/components/common/ConfirmModal";

interface FlashcardSetEditorProps {
  flashcardSet: FlashcardSet;
  onBack: () => void;
  onSetUpdated: (updatedSet: FlashcardSet) => void;
}

const FlashcardSetEditor: React.FC<FlashcardSetEditorProps> = ({
  flashcardSet,
  onBack,
  onSetUpdated,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [deletingCardId, setDeletingCardId] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    difficulty: Difficulty.MEDIUM as Difficulty,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setFormData({ question: "", answer: "", difficulty: Difficulty.MEDIUM });
    setIsAdding(false);
    setEditingCardId(null);
  };

  const handleEditClick = (card: any) => {
    setFormData({
      question: card.question,
      answer: card.answer,
      difficulty: card.difficulty || Difficulty.MEDIUM,
    });
    setEditingCardId(card._id);
    setIsAdding(false);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleSubmit = async () => {
    if (!formData.question.trim() || !formData.answer.trim()) {
      toast.error("Vui lòng nhập đủ câu hỏi và câu trả lời");
      return;
    }

    setIsSubmitting(true);
    try {
      let result;
      if (isAdding) {
        result = await flashcardService.addFlashcardToSet(
          flashcardSet._id,
          formData
        );
        toast.success("Thêm thẻ thành công");
      } else if (editingCardId) {
        result = await flashcardService.updateFlashcardInSet(
          flashcardSet._id,
          editingCardId,
          formData
        );
        toast.success("Cập nhật thẻ thành công");
      }
      
      if (result?.data) {
        onSetUpdated(result.data as any);
      }
      resetForm();
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCard = async () => {
    if (!deletingCardId) return;

    try {
      const result = await flashcardService.deleteFlashcardFromSet(
        flashcardSet._id,
        deletingCardId
      );
      toast.success("Xóa thẻ thành công");
      if (result?.data) {
        onSetUpdated(result.data as any);
      }
    } catch (error: any) {
      toast.error(error.message || "Xóa thẻ thất bại");
    } finally {
      setDeletingCardId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              {flashcardSet.title}
            </h3>
            <p className="text-sm font-medium text-slate-500 mt-1">
              {flashcardSet.cards.length} thẻ
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            resetForm();
            setIsAdding(true);
            setTimeout(() => {
              formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 100);
          }}
          className="inline-flex items-center justify-center gap-2 px-6 h-11 font-semibold rounded-xl transition-all duration-200 bg-linear-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-600 hover:to-teal-600"
        >
          <Plus className="w-4 h-4 text-white" strokeWidth={2.5} />
          Thêm thẻ mới
        </button>
      </div>

      {/* Editor Form (Add/Edit) */}
      {(isAdding || editingCardId) && (
        <div ref={formRef} className="bg-white border-2 border-emerald-100 rounded-2xl p-6 shadow-sm">
          <h4 className="text-md font-semibold text-slate-800 mb-4">
            {isAdding ? "Thêm thẻ mới" : "Chỉnh sửa thẻ"}
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Mặt trước (Câu hỏi)
              </label>
              <textarea
                value={formData.question}
                onChange={(e) =>
                  setFormData({ ...formData, question: e.target.value })
                }
                className="w-full p-3 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500 min-h-[80px]"
                placeholder="Nhập câu hỏi..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Mặt sau (Câu trả lời)
              </label>
              <textarea
                value={formData.answer}
                onChange={(e) =>
                  setFormData({ ...formData, answer: e.target.value })
                }
                className="w-full p-3 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500 min-h-[80px]"
                placeholder="Nhập câu trả lời..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Độ khó
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) =>
                  setFormData({ ...formData, difficulty: e.target.value as Difficulty })
                }
                className="w-full h-11 px-4 border border-slate-300 rounded-xl bg-white focus:outline-none focus:border-emerald-500"
              >
                <option value={Difficulty.EASY}>Dễ</option>
                <option value={Difficulty.MEDIUM}>Trung bình</option>
                <option value={Difficulty.HARD}>Khó</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={resetForm}
                className="px-5 h-10 border-2 border-slate-200 rounded-xl text-slate-600 font-medium hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-5 h-10 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 disabled:opacity-50"
              >
                {isSubmitting ? "Đang lưu..." : "Lưu thẻ"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 min-w-[700px]">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
            <tr>
              <th className="px-6 py-4 font-semibold w-5/12">Mặt trước</th>
              <th className="px-6 py-4 font-semibold w-5/12">Mặt sau</th>
              <th className="px-6 py-4 font-semibold w-1/12 text-center">Độ khó</th>
              <th className="px-6 py-4 font-semibold w-1/12 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {flashcardSet.cards.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                  Chưa có thẻ nào trong bộ flashcard này.
                </td>
              </tr>
            ) : (
              flashcardSet.cards.map((card) => (
                <tr
                  key={card._id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-6 py-4 align-top">
                    <p className="line-clamp-3 font-medium text-slate-700">
                      {card.question}
                    </p>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <p className="line-clamp-3">{card.answer}</p>
                  </td>
                  <td className="px-6 py-4 align-top text-center">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                        card.difficulty === Difficulty.EASY
                          ? "bg-green-100 text-green-700"
                          : card.difficulty === Difficulty.HARD
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {card.difficulty === Difficulty.EASY
                        ? "Dễ"
                        : card.difficulty === Difficulty.HARD
                        ? "Khó"
                        : "TB"}
                    </span>
                  </td>
                  <td className="px-6 py-4 align-top text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEditClick(card)}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Sửa"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingCardId(card._id || null)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>

      <ConfirmModal
        isOpen={!!deletingCardId}
        onClose={() => setDeletingCardId(null)}
        onConfirm={handleDeleteCard}
        title="Xóa thẻ flashcard"
        message="Bạn có chắc chắn muốn xóa thẻ flashcard này không? Hành động này không thể hoàn tác."
        confirmText="Xóa thẻ"
        cancelText="Hủy"
        variant="danger"
      />
    </div>
  );
};

export default FlashcardSetEditor;
