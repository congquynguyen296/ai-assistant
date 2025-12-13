import { useState } from "react";
import { useParams } from "react-router-dom";
import aiService from "../../services/aiService";
import { toast } from "sonner";
import { BookOpen, Lightbulb, Sparkles, Send } from "lucide-react";
import InfoModal from "../common/InfoModal";

const AIActions = () => {
  const { documentId } = useParams();

  const [loadingAction, setLoadingAction] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [concept, setConcept] = useState("");

  // Generate summary func
  const handleGenerateSummary = async () => {
    setLoadingAction("summary");

    try {
      const response = await aiService.generateSummary(documentId);
      setModalTitle("Tạo Summary");
      setIsModalOpen(true);
      setModalContent(response?.data);
    } catch (error) {
      console.log(`Có lỗi xảy ra khi tạo summary: ${error}`);
      toast.error("Có lỗi xảy ra khi tạo summary");
    } finally {
      setLoadingAction(null);
    }
  };

  // Explain concept func
  const handleExplainConcept = async (e) => {
    e.preventDefault();
    if (!concept.trim()) {
      toast.warning("Vui lòng cung cấp concept hợp lệ");
      return;
    }
    setLoadingAction("explain");

    try {
      const response = await aiService.explainConcept(documentId, concept);
      setModalTitle(`Giải thích: ${concept}`);
      setModalContent(response?.data?.explanation);
      setIsModalOpen(true);
      setConcept("");
    } catch (error) {
      console.log(`Có lỗi xảy ra khi tạo concept: ${error}`);
      toast.error("Có lỗi xảy ra khi tạo concept");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <>
      <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200/60 bg-linear-to-br from-slate-50/50 to-white/50">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from bg-emerald-500 to-emerald-600 shadow-lg shadow-purple-500/25 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            <div className="">
              <h3 className="text-lg font-semibold text-slate-900">Hyra</h3>
              <p className="text-xs text-slate-500">Powered by congquynguyen</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Generate summary */}
          <div className="group p-5 bg-linear-to-br from-slate-50/50 to-white rounded-xl border border-slate-200/60 hover:border-slate-300/60 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-50 to-cyan-100 flex items-center justify-center">
                    <BookOpen
                      className="w-4 h-4 text-blue-600"
                      strokeWidth={2}
                    />
                  </div>
                  <h4 className="font-semibold text-slate-900">Tạo summary</h4>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Tạo summary tổng qua cho tài liệu
                </p>
              </div>
              <button
                className="shrink-0 h-10 px-5 bg-linear-to-r from-teal-500 to-teal-600 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleGenerateSummary}
                disabled={loadingAction === "summary"}
              >
                {loadingAction === "summary" ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Đang tải...
                  </span>
                ) : (
                  "Summarize"
                )}
              </button>
            </div>
          </div>

          {/* Explain concept */}
          <div className="group p-5 bg-linear-to-br from-slate-50/50 to-white rounded-xl border border-slate-200/60 hover:border-slate-300/60 hover:shadow-md transition-all duration-200">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-linear-to-br from-white to-yellow-100 flex items-center justify-center">
                  <Lightbulb
                    className="w-4 h-4 text-yellow-600"
                    strokeWidth={2}
                  />
                </div>
                <h4 className="font-semibold text-slate-900">
                  Giải thích concept
                </h4>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Giải thích bất kỳ từ khóa nào từ tài liệu
              </p>

              {/* Input form */}
              <form
                onSubmit={handleExplainConcept}
                className="flex items-end gap-3"
              >
                <div className="flex-1">
                  <input
                    type="text"
                    value={concept}
                    onChange={(e) => setConcept(e.target.value)}
                    placeholder="Nhập concept cần giải thích..."
                    className="w-full h-12 px-4 border-2 border-slate-200 rounded-xl bg-white text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none focus:border-yellow-500 transition-all duration-200"
                    disabled={loadingAction === "explain"}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loadingAction === "explain" || !concept.trim()}
                  className="shrink-0 w-12 h-12 bg-linear-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/25 transition-all duration-200 disabled:opacity-50 text-white disabled:cursor-not-allowed"
                >
                  {loadingAction === "explain" ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" strokeWidth={2} />
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Info Modal for Summary and Explain */}
      <InfoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalTitle}
        content={modalContent}
        icon={modalTitle.includes("Summary") ? BookOpen : Lightbulb}
        variant={modalTitle.includes("Summary") ? "info" : "warning"}
      />
    </>
  );
};

export default AIActions;
