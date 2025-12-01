import mongoose from "mongoose";

const quizSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Tiêu đề quiz không được để trống"],
      trim: true,
    },
    questions: [
      {
        question: {
          type: String,
          required: true,
        },
        options: {
          type: [String],
          required: true,
          validate: [(array) => array.length === 4, "Phải có đúng 4 lựa chọn"],
        },
        correctAnswer: {
          type: String,
          required: true,
        },
        explaintion: {
          type: String,
          default: "",
        },
        difficulty: {
          type: String,
          enum: ["easy", "medium", "hard"],
          default: "medium",
        },
      },
    ],
    userAnswer: [
      {
        questionIndex: {
          type: Number,
          required: true,
        },
        selectedAnswer: {
          type: String,
          required: true,
        },
        isCorrect: {
          type: Boolean,
          required: true,
        },
        answerAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    score: {
      type: Number,
      default: 0,
    },
    totalQuestions: {
      type: Number,
      default: 0,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexs for faster queries
quizSchema.index({ userId: 1, documentId: 1 });

const Quiz = mongoose.model("Quiz", quizSchema);
export default Quiz;
