import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import LoginPage from "@/pages/Auth/LoginPage";
import RegisterPage from "@/pages/Auth/RegisterPage";
import NotFoundPage from "@/pages/NotFoundPage";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DocumentDetailPage from "@/pages/Documents/DocumentDetailPage";
import DocumentListPage from "@/pages/Documents/DocumentListPage";
import FlashCardListPage from "@/pages/Flashcards/FlashcardListPage";
import FlashCardDetailPage from "@/pages/Flashcards/FlashcardDetailPage";
import QuizTakePage from "@/pages/Quizzes/QuizTakePage";
import QuizResultPage from "@/pages/Quizzes/QuizResultPage";
import { useAuth } from "@/context/AuthContext";

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

        {/* Protected route */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<div>Dashboard</div>} />

          <Route path="/profile" element={<div>Profile</div>} />

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
        </Route>

        <Route path="/quizzes/:quizId" element={<QuizTakePage />} />
        <Route path="/quizzes/:quizId/result" element={<QuizResultPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}
