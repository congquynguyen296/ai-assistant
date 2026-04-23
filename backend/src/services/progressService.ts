import Document from "@/models/Document.js";
import Quiz from "@/models/Quiz.js";
import Flashcard from "@/models/Flashcard.js";

export const getDashboardService = async (input: {
  userId: string;
}): Promise<Record<string, unknown>> => {
  const { userId } = input;
  const totalDocuments = await Document.countDocuments({ userId });
  const totalQuizzes = await Quiz.countDocuments({ userId });
  const totalFlashcardSets = await Flashcard.countDocuments({ userId });
  const completedQuizzed = await Quiz.countDocuments({
    userId,
    completedAt: { $ne: null },
  });

  const flashcardSets = await Flashcard.find({ userId });
  let totalFlashcards = 0;
  let reviviewedFlashcards = 0;
  let starredFlashcards = 0;

  for (const flashcardSet of flashcardSets) {
    totalFlashcards += flashcardSet.cards.length;
    reviviewedFlashcards += flashcardSet.cards.filter(
      (card) => card.reviewCount > 0,
    ).length;
    starredFlashcards += flashcardSet.cards.filter((card) => card.isStarred)
      .length;
  }

  const quizzes = await Quiz.find({ userId, completedAt: { $ne: null } });
  const averageScore =
    quizzes.length > 0
      ? Math.round(
          quizzes.reduce((sum, quiz) => sum + quiz.score, 0) / quizzes.length,
        )
      : 0;

  const recentDocuments = await Document.find({ userId })
    .sort({ lastAccessed: -1 })
    .limit(5)
    .select("title fileName fileUrl lastAccessed status");

  const recentQuizzes = await Quiz.find({ userId })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("documentId", "title")
    .select("title score totalQuestions completedAt");

  const studySteak = Math.floor(Math.random() * 7) + 1;
  return {
    overview: {
      totalDocuments,
      totalFlashcardSets,
      totalFlashcards,
      reviviewedFlashcards,
      starredFlashcards,
      totalQuizzes,
      completedQuizzed,
      averageScore,
      studySteak,
    },
    recentActivity: {
      documents: recentDocuments,
      quizzes: recentQuizzes,
    },
  };
};
