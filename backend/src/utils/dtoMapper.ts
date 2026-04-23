import type { DocumentRef, DocumentRefDto } from "@/types/common.js";
import type { DocumentResponseDto } from "@/dtos/documents/document.response.dto.js";
import type {
  FlashcardCardDto,
  FlashcardSetResponseDto,
} from "@/dtos/flashcards/flashcard.response.dto.js";
import type {
  QuizAnswerDto,
  QuizQuestionDto,
  QuizResponseDto,
  QuizSubmitAnswerDto,
} from "@/dtos/quiz/quiz.dto.js";

const toStringId = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "toString" in value) {
    return (value as { toString: () => string }).toString();
  }
  return "";
};

const asRecord = (value: unknown): Record<string, unknown> => {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
};

const toOptionalString = (value: unknown): string | undefined => {
  if (value === undefined) return undefined;
  if (value === null) return undefined;
  return String(value);
};

const toOptionalNullableString = (
  value: unknown,
): string | null | undefined => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  return String(value);
};

const toOptionalNumber = (value: unknown): number | undefined => {
  if (value === undefined || value === null) return undefined;
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return undefined;
  return parsed;
};

const toDate = (value: unknown): Date | undefined => {
  if (value === undefined || value === null) return undefined;
  if (value instanceof Date) return value;
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

const toNullableDate = (value: unknown): Date | null | undefined => {
  if (value === null) return null;
  return toDate(value);
};

export const mapDocumentRef = (value: unknown): DocumentRef => {
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const docRef: DocumentRefDto = {
      _id: toStringId(record._id),
    };
    const title = toOptionalString(record.title);
    const fileName = toOptionalString(record.fileName);
    const fileUrl = toOptionalNullableString(record.fileUrl);
    if (title) docRef.title = title;
    if (fileName) docRef.fileName = fileName;
    if (fileUrl !== undefined) docRef.fileUrl = fileUrl;
    return docRef;
  }
  return toStringId(value);
};

export const mapDocumentResponse = (
  doc: unknown,
): DocumentResponseDto => {
  const record = asRecord(doc);
  return {
    _id: toStringId(record._id),
    userId: toStringId(record.userId),
    title: String(record.title ?? ""),
    fileName: String(record.fileName ?? ""),
    filePath: String(record.filePath ?? ""),
    fileUrl: toOptionalNullableString(record.fileUrl),
    mimeType: toOptionalString(record.mimeType),
    fileSize: Number(record.fileSize ?? 0),
    extractedText: toOptionalString(record.extractedText),
    status: record.status as DocumentResponseDto["status"],
    uploadDate: toDate(record.uploadDate),
    lastAccessed: toDate(record.lastAccessed),
    createdAt: toDate(record.createdAt),
    updatedAt: toDate(record.updatedAt),
    flashcardCount: toOptionalNumber(record.flashcardCount),
    quizCount: toOptionalNumber(record.quizCount),
  };
};

export const mapFlashcardCard = (
  card: Record<string, unknown>,
): FlashcardCardDto => ({
  _id: toOptionalString(card._id),
  question: String(card.question ?? ""),
  answer: String(card.answer ?? ""),
  difficulty: (card.difficulty as FlashcardCardDto["difficulty"]) || "medium",
  lastReviewed: toNullableDate(card.lastReviewed),
  reviewCount: Number(card.reviewCount ?? 0),
  isStarred: Boolean(card.isStarred),
});

export const mapFlashcardSet = (
  doc: unknown,
): FlashcardSetResponseDto => {
  const record = asRecord(doc);
  return {
    _id: toStringId(record._id),
    userId: toStringId(record.userId),
    documentId: mapDocumentRef(record.documentId),
    title: String(record.title ?? ""),
    cards: Array.isArray(record.cards)
      ? record.cards.map((card) =>
          mapFlashcardCard(card as Record<string, unknown>),
        )
      : [],
    createdAt: toDate(record.createdAt),
    updatedAt: toDate(record.updatedAt),
  };
};

export const mapQuizQuestion = (
  question: Record<string, unknown>,
): QuizQuestionDto => ({
  question: String(question.question ?? ""),
  options: Array.isArray(question.options)
    ? question.options.map((option) => String(option))
    : [],
  correctAnswer: String(question.correctAnswer ?? ""),
  explanation: toOptionalString(question.explanation),
  difficulty: question.difficulty as QuizQuestionDto["difficulty"],
});

export const mapQuizAnswer = (
  answer: Record<string, unknown>,
): QuizSubmitAnswerDto => ({
  questionIndex: Number(answer.questionIndex ?? 0),
  selectedAnswer: String(answer.selectedAnswer ?? ""),
  isCorrect: Boolean(answer.isCorrect),
  answerAt: toDate(answer.answerAt),
});

export const mapQuiz = (doc: unknown): QuizResponseDto => {
  const record = asRecord(doc);
  return {
    _id: toStringId(record._id),
    userId: toStringId(record.userId),
    documentId: mapDocumentRef(record.documentId),
    title: String(record.title ?? ""),
    questions: Array.isArray(record.questions)
      ? record.questions.map((q) => mapQuizQuestion(q as Record<string, unknown>))
      : [],
    userAnswer: Array.isArray(record.userAnswer)
      ? record.userAnswer.map((a) =>
          mapQuizAnswer(a as Record<string, unknown>),
        )
      : [],
    score: Number(record.score ?? 0),
    totalQuestions: Number(record.totalQuestions ?? 0),
    completedAt: toNullableDate(record.completedAt),
    createdAt: toDate(record.createdAt),
    updatedAt: toDate(record.updatedAt),
  };
};

export const mapQuizAnswers = (answers: QuizAnswerDto[]): QuizAnswerDto[] =>
  answers.map((answer) => ({
    questionIndex: Number(answer.questionIndex ?? 0),
    selectedAnswer: String(answer.selectedAnswer ?? ""),
  }));
