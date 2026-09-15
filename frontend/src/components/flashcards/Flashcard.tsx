import { useEffect, useState } from "react";
import { toast } from "sonner";
import flashcardService from "@/services/flashcardService";
import {
  Star,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  ArrowLeft,
  Check,
  X,
  Frown,
  Smile,
} from "lucide-react";

interface FlashcardProps {
  cards: any[];
  isReviewMode?: boolean;
  onBack: () => void;
  onUpdateCards: (updatedCards: any[]) => void;
}

const Flashcard = ({ cards, isReviewMode = false, onBack, onUpdateCards }: FlashcardProps) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset flip state when card changes
  useEffect(() => {
    setIsFlipped(false);
  }, [currentCardIndex]);

  // Get difficulty badge color
  const getDifficultyColor = (difficulty?: string) => {
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

  // Function handle next flashcard action (Browse mode only)
  const handleNextCard = () => {
    if (cards.length > 0 && !isReviewMode) {
      setCurrentCardIndex((prevIndex) => (prevIndex + 1) % cards.length);
    }
  };

  // Function handle prev flashcard action (Browse mode only)
  const handlePrevCard = () => {
    if (cards.length > 0 && !isReviewMode) {
      setCurrentCardIndex(
        (prevIndex) => (prevIndex - 1 + cards.length) % cards.length
      );
    }
  };

  // Handle grade review (Review mode only)
  const handleGrade = async (grade: number) => {
    if (isSubmitting) return;
    
    const currentCard = cards[currentCardIndex];
    if (!currentCard) return;

    setIsSubmitting(true);
    try {
      await flashcardService.reviewFlashcard(currentCard._id, grade);
      
      let updatedCards = [...cards];
      
      // Nếu người dùng chọn Quên (1), đẩy thẻ xuống cuối để học lại trong cùng session
      if (grade === 1) {
        // Tạo bản sao và đẩy vào cuối mảng
        const cardToRepeat = { ...currentCard, status: "learning" };
        updatedCards.push(cardToRepeat);
      }
      
      // Đánh dấu thẻ hiện tại là đã review (nếu đang ở Review mode, ta có thể chỉ cần tiến index)
      // Nhưng vì In-session Queue thêm thẻ vào cuối, ta vẫn cứ tăng index lên 1 để học thẻ tiếp theo
      onUpdateCards(updatedCards);
      
      if (currentCardIndex + 1 < updatedCards.length) {
        setCurrentCardIndex((prev) => prev + 1);
      } else {
        // Hết thẻ để học, gọi onBack (hoặc hiện thông báo hoàn thành)
        toast.success("Đã hoàn thành phiên ôn tập!");
        onBack();
      }
    } catch (error) {
      console.log(`Review flashcard không thành công: ${error}`);
      toast.error("Có lỗi xảy ra khi đánh giá flashcard");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle flip card
  const handleFlipCard = () => {
    if (!isFlipped) {
      setIsFlipped(true);
    } else if (!isReviewMode) {
      // In review mode, tapping back side doesn't flip back, must choose grade
      setIsFlipped(false);
    }
  };

  // Handle toggle star for flashcard
  const handleToggleStar = async (cardId: string) => {
    try {
      await flashcardService.toggleStarFlashcard(cardId);
      const updatedCards = cards.map((card) =>
        card._id === cardId ? { ...card, isStarred: !card.isStarred } : card
      );
      onUpdateCards(updatedCards);
      toast.success("Cập nhật thành công");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi lưu flashcard. Vui lòng thử lại sau");
    }
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault(); // Prevent page scrolling
        handleFlipCard();
      } else if (!isReviewMode) {
        if (e.key === "ArrowLeft") {
          handlePrevCard();
        } else if (e.key === "ArrowRight") {
          handleNextCard();
        }
      } else if (isReviewMode && isFlipped && !isSubmitting) {
        // SRS Shortcuts: 1(Quên), 2(Khó), 3(Tốt), 4(Dễ)
        if (e.key === "1") handleGrade(1);
        if (e.key === "2") handleGrade(2);
        if (e.key === "3") handleGrade(3);
        if (e.key === "4") handleGrade(4);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentCardIndex, isFlipped, cards, isReviewMode, isSubmitting]);

  if (!cards || cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-slate-500">Không có flashcard nào</p>
      </div>
    );
  }

  const currentCard = cards[currentCardIndex];
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
          {currentCardIndex + 1} / {cards.length}
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
              className="absolute inset-0 w-full h-full backface-hidden bg-white/90 backdrop-blur-xl border-2 border-slate-200 rounded-3xl shadow-xl p-5 md:p-8 flex flex-col cursor-pointer"
              style={{ backfaceVisibility: "hidden" }}
              onClick={handleFlipCard}
            >
              <div className="flex items-start justify-between mb-4 md:mb-6 shrink-0">
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

              <div className="flex-1 min-h-0 w-full overflow-y-auto custom-scrollbar pr-2 flex flex-col">
                <div className="my-auto flex flex-col items-center text-center py-6 w-full">
                  <div className="mb-4 shrink-0">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Câu hỏi
                    </span>
                  </div>
                  <h3 className="text-2xl font-semibold text-slate-900 leading-relaxed">
                    {currentCard.question}
                  </h3>
                </div>
              </div>

              <div className="mt-4 md:mt-6 text-center shrink-0">
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
              className="absolute inset-0 w-full h-full backface-hidden bg-linear-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-3xl shadow-xl p-5 md:p-8 flex flex-col rotate-y-180 cursor-pointer"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
              onClick={handleFlipCard}
            >
              <div className="flex items-start justify-between mb-4 md:mb-6 shrink-0">
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

              <div className="flex-1 min-h-0 w-full overflow-y-auto custom-scrollbar pr-2 flex flex-col">
                <div className="my-auto flex flex-col items-center text-center py-6 w-full">
                  <div className="mb-4 shrink-0">
                    <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">
                      Câu trả lời
                    </span>
                  </div>
                  <p className="text-lg font-medium text-slate-800 leading-relaxed">
                    {currentCard.answer}
                  </p>
                </div>
              </div>

              {isReviewMode ? (
                <div className="mt-4 shrink-0 border-t border-emerald-200/50 pt-4">
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleGrade(1); }}
                      disabled={isSubmitting}
                      className="flex flex-col items-center gap-2 py-3 px-2 sm:px-4 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      <Frown className="w-5 h-5" />
                      <span className="text-xs font-bold text-center">Quên (1)</span>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleGrade(2); }}
                      disabled={isSubmitting}
                      className="flex flex-col items-center gap-2 py-3 px-2 sm:px-4 rounded-lg bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors disabled:opacity-50"
                    >
                      <X className="w-5 h-5" />
                      <span className="text-xs font-bold text-center">Khó (2)</span>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleGrade(3); }}
                      disabled={isSubmitting}
                      className="flex flex-col items-center gap-2 py-3 px-2 sm:px-4 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors disabled:opacity-50"
                    >
                      <Check className="w-5 h-5" />
                      <span className="text-xs font-bold text-center">Tốt (3)</span>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleGrade(4); }}
                      disabled={isSubmitting}
                      className="flex flex-col items-center gap-2 py-3 px-2 sm:px-4 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors disabled:opacity-50"
                    >
                      <Smile className="w-5 h-5" />
                      <span className="text-xs font-bold text-center">Dễ (4)</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 md:mt-6 text-center shrink-0">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 rounded-lg">
                    <RotateCcw className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-700">
                      Click để lật lại
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation controls (Only show in Browse Mode) */}
      {!isReviewMode && (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handlePrevCard}
            className="w-12 h-12 flex items-center justify-center bg-white border-2 border-slate-200 hover:border-emerald-300 rounded-xl transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={cards.length <= 1}
          >
            <ChevronLeft className="w-5 h-5 text-slate-600" strokeWidth={2} />
          </button>

          <div className="px-6 py-2 bg-slate-100 rounded-xl">
            <span className="text-sm font-semibold text-slate-700">
              {currentCardIndex + 1} / {cards.length}
            </span>
          </div>

          <button
            onClick={handleNextCard}
            className="w-12 h-12 flex items-center justify-center bg-white border-2 border-slate-200 hover:border-emerald-300 rounded-xl transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={cards.length <= 1}
          >
            <ChevronRight className="w-5 h-5 text-slate-600" strokeWidth={2} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Flashcard;
