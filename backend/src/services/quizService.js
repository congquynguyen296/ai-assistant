import { AppError } from "../middlewares/errorHandle.js";
import Quiz from "../models/Quiz.js";

export const getQuizzesService = async ({ userId, documentId }) => {
  const quizzes = await Quiz.find({ userId, documentId })
    .populate("documentId", "title fileName fileUrl")
    .sort({ createdAt: -1 })
    .lean();

  return quizzes;
};

export const getQuizByIdService = async ({ userId, quizId }) => {
  const quiz = await Quiz.findOne({ userId, _id: quizId })
    .populate("documentId", "title fileName fileUrl")
    .lean();

  if (!quiz) {
    throw new AppError("Quiz không tồn tại", 404);
  }

  return quiz;
};

export const submitQuizService = async ({ userId, quizId, answers }) => {
  const quiz = await Quiz.findOne({ userId, _id: quizId });
  if (!quiz) {
    throw new AppError("Quiz không tồn tại", 404);
  }

  // Optional: Can add logic to grade the quiz based on answers

  // Process submittion
  let correctCount = 0;
  const userAnswers = [];

  answers.forEach((answer) => {
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

  // Calculate score
  const score = (correctCount / quiz.totalQuestions) * 100;

  // Update quiz with user answers and score
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

export const getQuizResultsService = async ({ userId, quizId }) => {
  const quiz = await Quiz.findOne({ userId, _id: quizId });

  if (!quiz) {
    throw new AppError("Quiz không tồn tại", 404);
  }

  if (!quiz.completedAt) {
    throw new AppError("Quiz chưa được hoàn thành", 400);
  }

  // Build detailed results
  const detailedResults = quiz.questions.map((question, index) => {
    const userAnswer = quiz.userAnswer.find(
      (answer) => answer.questionIndex === index
    );

    return {
      questionIndex: index,
      question: question.question,
      options: question.options,
      correctAnswer: question.correctAnswer,
      selectedAnswer: userAnswer?.selectedAnswer || null,
      isCorrect: userAnswer?.isCorrect || false,
      explaintion: question.explaintion,
      difficulty: question.difficulty,
    };
  });

  return {
    quiz: {
      quizId: quiz._id,
      title: quiz.title,
      documentId: quiz.documentId,
      score: quiz.score,
      totalQuestions: quiz.totalQuestions,
      completedAt: quiz.completedAt,
    },
    results: detailedResults,
  };
};

export const deleteQuizService = async ({ userId, quizId }) => {
  const quiz = await Quiz.findOne({ userId, _id: quizId });

  if (!quiz) {
    throw new AppError("Quiz không tồn tại", 404);
  }

  await quiz.deleteOne();
  console.log(`Quiz ${quizId} đã được xóa`);
};
