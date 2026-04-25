import type { ReactNode } from "react";

export interface User {
  _id?: string;
  username?: string;
  email?: string;
  profileImage?: string;
}

export interface Document {
  _id: string;
  title?: string;
  fileName?: string;
  filePath?: string;
  fileUrl?: string;
  mimeType?: string;
  fileSize?: number;
  createdAt?: string;
  flashcardCount?: number;
  quizCount?: number;
  lastAccessed?: string;
}

export interface Flashcard {
  _id: string;
  question: string;
  answer?: string;
  difficulty?: string;
  isStarred?: boolean;
  reviewCount?: number;
}

export interface FlashcardSet {
  _id: string;
  title?: string;
  createAt?: string;
  cards: Flashcard[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer?: string;
  explanation?: string;
}

export interface Quiz {
  _id: string;
  quizId?: string;
  title?: string;
  createdAt?: string;
  totalQuestions?: number;
  score?: number;
  userAnswer?: string[];
  questions: QuizQuestion[];
}

export interface QuizResultItem {
  question: string;
  options: string[];
  selectedAnswer?: string;
  correctAnswer?: string;
  isCorrect: boolean;
  explanation?: string;
}

export interface QuizResultsPayload {
  quiz: Quiz;
  results: QuizResultItem[];
}

export interface DashboardOverview {
  totalDocuments: number;
  totalFlashcards: number;
  totalQuizzes: number;
}

export interface DashboardActivity {
  documents: Document[];
  quizzes: Quiz[];
}

export interface DashboardData {
  overview: DashboardOverview;
  recentActivity?: DashboardActivity;
}

export interface ChatMessage {
  role: string;
  content: string;
  timestamp?: string;
  revelantChunks?: unknown[];
}

export interface PaymentPlan {
  name: string;
  description: string;
  price: string;
  period: string;
  icon: ReactNode;
  features: string[];
  buttonText: string;
  isPopular?: boolean;
  isCurrent?: boolean;
  note?: string;
}

export interface NotificationItem {
  id: number | string;
  title: string;
  message: string;
  type?: string;
  time: string;
  isRead?: boolean;
  link?: string | null;
}

export interface Conversation {
  id: string;
  name: string;
  time: string;
  members: string;
  avatar: string;
  lastMessage: string;
}

export interface ThreadMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  time: string;
}
