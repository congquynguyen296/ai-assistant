import { useEffect, useState } from "react";
import { toast } from "sonner";
import flashcardService from "../../services/flashcardService";
import {
  Star,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  ArrowLeft,
} from "lucide-react";

const Flashcard = ({ flashcardSet, onBack, onUpdateSet }) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Reset flip state when card changes
  useEffect(() => {
    setIsFlipped(false);
  }, [currentCardIndex]);

  // Get difficulty badge color
  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return {
          bg: "bg-green-50",
          border: "border-green-200",
          text: "text-green-700",
          label: "Dễ",
        };
      case "medium":
        return {
          bg: "bg-yellow-50",
          border: "border-yellow-200",
          text: "text-yellow-700",
          label: "Trung bình",
        };
      case "hard":
        return {
          bg: "bg-red-50",
          border: "border-red-200",
          text: "text-red-700",
          label: "Khó",
        };
      default:
        return {
          bg: "bg-slate-50",
          border: "border-slate-200",
          text: "text-slate-700",
          label: "N/A",
        };
    }
  };

  // Function handle next flashcard action
  const handleNextCard = () => {
    if (flashcardSet) {
      setCurrentCardIndex(
        (prevIndex) => (prevIndex + 1) % flashcardSet.cards.length
      );
    }
  };

  // Function handle prev flashcard action
  const handlePrevCard = () => {
    if (flashcardSet) {
      setCurrentCardIndex(
        (prevIndex) =>
          (prevIndex - 1 + flashcardSet.cards.length) %
          flashcardSet.cards.length
      );
    }
  };

  // Helper function review card
  const handleReview = async () => {
    const currentCard = flashcardSet?.cards[currentCardIndex];
    if (!currentCard) return;

    try {
      await flashcardService.reviewFlashcard(currentCard._id);
      // Update local state
      const updatedCards = flashcardSet.cards.map((card) =>
        card._id === currentCard._id
          ? { ...card, reviewCount: (card.reviewCount || 0) + 1 }
          : card
      );
      const updatedSet = { ...flashcardSet, cards: updatedCards };
      onUpdateSet(updatedSet);
    } catch (error) {
      console.log(`Review flashcard không thành công: ${error}`);
      toast.error("Có lỗi xảy ra khi review flashcard");
    }
  };

  // Handle flip card
  const handleFlipCard = () => {
    if (!isFlipped) {
      // Flipping to back side - increase review count
      setIsFlipped(true);
      handleReview();
    } else {
      // Flipping back to front side
      setIsFlipped(false);
    }
  };

  // Handle toggle star for flashcard
  const handleToggleStar = async (cardId) => {
    try {
      await flashcardService.toggleStarFlashcard(cardId);
      const updatedCards = flashcardSet.cards.map((card) =>
        card._id === cardId ? { ...card, isStarred: !card.isStarred } : card
      );
      const updatedSet = { ...flashcardSet, cards: updatedCards };
      onUpdateSet(updatedSet);
      toast.success("Cập nhật thành công");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi lưu flashcard. Vui lòng thử lại sau");
    }
  };

  if (!flashcardSet || !flashcardSet.cards || flashcardSet.cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-slate-500">Không có flashcard nào trong bộ này</p>
      </div>
    );
  }

  const currentCard = flashcardSet.cards[currentCardIndex];
  if (!currentCard) return null;

  const difficultyColors = getDifficultyColor(currentCard.difficulty);

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 h-10 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={2} />
          Quay lại
        </button>
        <div className="text-sm font-medium text-slate-500">
          {currentCardIndex + 1} / {flashcardSet.cards.length}
        </div>
      </div>

      {/* Flashcard */}
      <div className="flex items-center justify-center min-h-[400px]">
        <div
          className="relative w-full max-w-2xl h-[400px] perspective-1000"
          style={{ perspective: "1000px" }}
        >
          <div
            className={`relative w-full h-full preserve-3d transition-transform duration-500 ${
              isFlipped ? "rotate-y-180" : ""
            }`}
            style={{
              transformStyle: "preserve-3d",
              transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >
            {/* Front side - Question */}
            <div
              className="absolute inset-0 w-full h-full backface-hidden bg-white/90 backdrop-blur-xl border-2 border-slate-200 rounded-3xl shadow-xl p-8 flex flex-col cursor-pointer"
              style={{ backfaceVisibility: "hidden" }}
              onClick={handleFlipCard}
            >
              <div className="flex items-start justify-between mb-6">
                <div
                  className={`px-3 py-1.5 rounded-lg border ${difficultyColors.bg} ${difficultyColors.border}`}
                >
                  <span
                    className={`text-xs font-semibold ${difficultyColors.text}`}
                  >
                    {difficultyColors.label}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleStar(currentCard._id);
                  }}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200 ${
                    currentCard.isStarred
                      ? "text-yellow-500 bg-yellow-50"
                      : "text-slate-400 hover:text-yellow-500 hover:bg-yellow-50"
                  }`}
                >
                  <Star
                    className={`w-5 h-5 ${
                      currentCard.isStarred ? "fill-current" : ""
                    }`}
                    strokeWidth={2}
                  />
                </button>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="mb-4">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Câu hỏi
                  </span>
                </div>
                <h3 className="text-2xl font-semibold text-slate-900 leading-relaxed">
                  {currentCard.question}
                </h3>
              </div>

              <div className="mt-6 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg">
                  <RotateCcw className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-600">
                    Click để lật thẻ
                  </span>
                </div>
              </div>
            </div>

            {/* Back side - Answer */}
            <div
              className="absolute inset-0 w-full h-full backface-hidden bg-linear-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-3xl shadow-xl p-8 flex flex-col rotate-y-180 cursor-pointer"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
              onClick={handleFlipCard}
            >
              <div className="flex items-start justify-between mb-6">
                <div
                  className={`px-3 py-1.5 rounded-lg border ${difficultyColors.bg} ${difficultyColors.border}`}
                >
                  <span
                    className={`text-xs font-semibold ${difficultyColors.text}`}
                  >
                    {difficultyColors.label}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleStar(currentCard._id);
                  }}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200 ${
                    currentCard.isStarred
                      ? "text-yellow-500 bg-yellow-50"
                      : "text-slate-400 hover:text-yellow-500 hover:bg-yellow-50"
                  }`}
                >
                  <Star
                    className={`w-5 h-5 ${
                      currentCard.isStarred ? "fill-current" : ""
                    }`}
                    strokeWidth={2}
                  />
                </button>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="mb-4">
                  <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">
                    Câu trả lời
                  </span>
                </div>
                <p className="text-lg font-medium text-slate-800 leading-relaxed">
                  {currentCard.answer}
                </p>
              </div>

              <div className="mt-6 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 rounded-lg">
                  <RotateCcw className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-700">
                    Click để lật lại
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation controls */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={handlePrevCard}
          className="w-12 h-12 flex items-center justify-center bg-white border-2 border-slate-200 hover:border-emerald-300 rounded-xl transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={flashcardSet.cards.length <= 1}
        >
          <ChevronLeft className="w-5 h-5 text-slate-600" strokeWidth={2} />
        </button>

        <div className="px-6 py-2 bg-slate-100 rounded-xl">
          <span className="text-sm font-semibold text-slate-700">
            {currentCardIndex + 1} / {flashcardSet.cards.length}
          </span>
        </div>

        <button
          onClick={handleNextCard}
          className="w-12 h-12 flex items-center justify-center bg-white border-2 border-slate-200 hover:border-emerald-300 rounded-xl transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={flashcardSet.cards.length <= 1}
        >
          <ChevronRight className="w-5 h-5 text-slate-600" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
};

export default Flashcard;
