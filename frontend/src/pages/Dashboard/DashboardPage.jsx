import { useState, useEffect } from "react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import progressService from "@/services/progressService";
import { TrendingUp } from "lucide-react";

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await progressService.getDashboardData();
        setDashboardData(response.data);
      } catch (error) {
        console.error("Lấy thông tin dashboard thất bại:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  // No data
  if (!dashboardData || !dashboardData.overview) {
    return (
      <div className="min-h-screen bg-gradiennt-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 mb-4">
            <TrendingUp className="w-8 h-8 text-emerald-500" />
          </div>
          <p className="text-sm text-slate-600">Chưa có dữ liệu.</p>
        </div>
      </div>
    );
  }

  // Data stastics
  const stats = [
    {
      label: "Documents",
      value: dashboardData.overview.totalDocuments,
      icon: FileText,
      gradient: "from-blue-400 to-cyan-500",
      shadowColor: "shadow-blue-500/25",
    },
    {
      label: "Flashcards",
      value: dashboardData.overview.totalFlashcards,
      icon: BookOpen,
      gradient: "from-purple-400 to-pink-500",
      shadowColor: "shadow-purple-500/25",
    },
    {
      label: "Quizzes",
      value: dashboardData.overview.totalQuizzes,
      icon: BrainCircuit,
      gradient: "from-emerald-400 to-teal-500",
      shadowColor: "shadow-emerald-500/25",
    },
  ];

  return (
    <div>
      <LoadingSpinner />
    </div>
  );
};

export default DashboardPage;
