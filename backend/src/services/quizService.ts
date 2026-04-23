import { AppError } from "@/middlewares/errorHandle.js";
import Quiz from "@/models/Quiz.js";
import { mapQuiz, mapQuizAnswers } from "@/utils/dtoMapper.js";
import type {
  QuizAnswerDto,
  QuizListResponseDto,
  QuizResultsResponseDto,
  QuizResponseDto,
} from "@/dtos/quiz/quiz.dto.js";

export const getQuizzesService = async (input: {
  userId: string;
  documentId: string;
}): Promise<QuizResponseDto[]> => {
  const quizzes = await Quiz.find({
    userId: input.userId,
    documentId: input.documentId,
  })
    .populate("documentId", "title fileName fileUrl")
    .sort({ createdAt: -1 })
    .lean();

  return (quizzes as unknown as Record<string, unknown>[]).map((quiz) =>
    mapQuiz(quiz),
  );
};

export const getAllQuizzesService = async (input: {
  userId: string;
  page: number;
  size: number;
}): Promise<QuizListResponseDto> => {
  const total = await Quiz.countDocuments({ userId: input.userId });
  const quizzes = await Quiz.find({ userId: input.userId })
    .populate("documentId", "title fileName fileUrl")
    .skip((input.page - 1) * input.size)
    .limit(input.size)
    .sort({ createdAt: -1 })
    .lean();

  return {
    quizzes: (quizzes as unknown as Record<string, unknown>[]).map((quiz) =>
      mapQuiz(quiz),
    ),
    pagination: {
      total,
      page: input.page,
      size: input.size,
      totalPages: Math.ceil(total / input.size),
    },
  };
};

export const getQuizByIdService = async (input: {
  userId: string;
  quizId: string;
}): Promise<QuizResponseDto> => {
  const quiz = await Quiz.findOne({ userId: input.userId, _id: input.quizId })
    .populate("documentId", "title fileName fileUrl")
    .lean();

  if (!quiz) {
    throw new AppError("Quiz không tồn tại", 404);
  }

  return mapQuiz(quiz as unknown as Record<string, unknown>);
};

export const submitQuizService = async (input: {
  userId: string;
  quizId: string;
  answers: QuizAnswerDto[];
}): Promise<Record<string, unknown>> => {
  const quiz = await Quiz.findOne({ userId: input.userId, _id: input.quizId });
  if (!quiz) {
    throw new AppError("Quiz không tồn tại", 404);
  }

  let correctCount = 0;
  const userAnswers: Array<{
    questionIndex: number;
    selectedAnswer: string;
    isCorrect: boolean;
    answerAt: Date;
  }> = [];

  mapQuizAnswers(input.answers).forEach((answer) => {
    const { questionIndex, selectedAnswer } = answer;

    if (questionIndex < quiz.questions.length) {
      const question = quiz.questions[questionIndex];
      const isCorrect = question.correctAnswer === selectedAnswer;

      if (isCorrect) {
        correctCount += 1;
      }

      userAnswers.push({
        questionIndex,
        selectedAnswer,
        isCorrect,
        answerAt: new Date(),
      });
    }
  });

  const score = (correctCount / quiz.totalQuestions) * 100;

  quiz.userAnswer = userAnswers;
  quiz.score = score;
  quiz.completedAt = new Date();
  await quiz.save();

  return {
    quizId: quiz._id,
    score: quiz.score,
    totalQuestions: quiz.totalQuestions,
    correctAnswers: correctCount,
    userAnswers: quiz.userAnswer,
    percentage: score,
  };
};

export const getQuizResultsService = async (input: {
  userId: string;
  quizId: string;
}): Promise<QuizResultsResponseDto> => {
  const quiz = await Quiz.findOne({ userId: input.userId, _id: input.quizId });

  if (!quiz) {
    throw new AppError("Quiz không tồn tại", 404);
  }

  if (!quiz.completedAt) {
    throw new AppError("Quiz chưa được hoàn thành", 400);
  }

  const detailedResults = quiz.questions.map((question, index) => {
    const userAnswer = quiz.userAnswer.find(
      (answer) => answer.questionIndex === index,
    );

    return {
      questionIndex: index,
      question: question.question,
      options: question.options,
      correctAnswer: question.correctAnswer,
      selectedAnswer: userAnswer?.selectedAnswer || null,
      isCorrect: userAnswer?.isCorrect || false,
      explanation: question.explanation,
      difficulty: question.difficulty,
    };
  });

  return {
    quiz: {
      quizId: quiz._id.toString(),
      title: quiz.title,
      documentId: quiz.documentId.toString(),
      score: quiz.score,
      totalQuestions: quiz.totalQuestions,
      completedAt: quiz.completedAt,
    },
    results: detailedResults,
  };
};

export const deleteQuizService = async (input: {
  userId: string;
  quizId: string;
}): Promise<void> => {
  const quiz = await Quiz.findOne({ userId: input.userId, _id: input.quizId });

  if (!quiz) {
    throw new AppError("Quiz không tồn tại", 404);
  }

  await quiz.deleteOne();
  console.log(`Quiz ${input.quizId} đã được xóa`);
};
