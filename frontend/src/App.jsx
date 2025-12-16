import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import LoginPage from "@/pages/Auth/LoginPage";
import RegisterPage from "@/pages/Auth/RegisterPage";
import AuthCallbackPage from "@/pages/Auth/AuthCallbackPage";
import NotFoundPage from "@/pages/NotFoundPage";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DocumentDetailPage from "@/pages/Documents/DocumentDetailPage";
import DocumentListPage from "@/pages/Documents/DocumentListPage";
import FlashCardListPage from "@/pages/Flashcards/FlashcardListPage";
import FlashCardDetailPage from "@/pages/Flashcards/FlashcardDetailPage";
import QuizTakePage from "@/pages/Quizzes/QuizTakePage";
import QuizResultPage from "@/pages/Quizzes/QuizResultPage";
import QuizReviewPage from "@/pages/Quizzes/QuizReviewPage";
import { useAuth } from "@/context/AuthContext";
import DashboardPage from "./pages/Dashboard/DashboardPage";
import ProfilePage from "./pages/Profile/ProfilePage";
import PaymentPage from "./pages/Payment/PaymentPage";
import ConfirmOTPPage from "./pages/Auth/ConfirmOTPPage";

export default function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <LoadingSpinner message="Đang tải..." variant="overlay" size="md" />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="confirm-otp" element={<ConfirmOTPPage />} />
        <Route path="/auth/google/callback" element={<AuthCallbackPage />} />

        {/* Protected route */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />

          <Route path="/profile" element={<ProfilePage />} />

          <Route path="/documents" element={<DocumentListPage />} />
          <Route
            path="/documents/:documentId"
            element={<DocumentDetailPage />}
          />
          <Route path="/flashcards" element={<FlashCardListPage />} />
          <Route
            path="/documents/:documentId/flashcards"
            element={<FlashCardDetailPage />}
          />

          <Route path="/payment" element={<PaymentPage />} />

          <Route path="/quizzes/:quizId" element={<QuizTakePage />} />
          <Route path="/quizzes/:quizId/review" element={<QuizReviewPage />} />
          <Route path="/quizzes/:quizId/result" element={<QuizResultPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}
