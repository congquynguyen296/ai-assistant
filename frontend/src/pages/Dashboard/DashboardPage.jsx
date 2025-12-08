import { useState, useEffect } from "react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import progressService from "../../services/progressService";
import {
  BookOpen,
  BrainCircuit,
  Clock,
  FileText,
  TrendingUp,
} from "lucide-react";

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await progressService.getDashboard();
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
      borderColor: "hover:border-blue-500/50",
    },
    {
      label: "Flashcards",
      value: dashboardData.overview.totalFlashcards,
      icon: BookOpen,
      gradient: "from-purple-400 to-pink-500",
      shadowColor: "shadow-purple-500/25",
      borderColor: "hover:border-purple-500/50",
    },
    {
      label: "Quizzes",
      value: dashboardData.overview.totalQuizzes,
      icon: BrainCircuit,
      gradient: "from-emerald-400 to-teal-500",
      shadowColor: "shadow-emerald-500/25",
      borderColor: "hover:border-emerald-500/50",
    },
  ];

  return (
    <div className="min-h-screen relative w-full">
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] pointer-events-none z-0"></div>
      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-medium text-slate-900 tracking-tight mb-2">
            Thống kê tổng quan
          </h1>
          <p className="text-slate-500 text-sm">
            Tổng quan về hoạt động học tập của bạn.
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-5">
          {stats.map((stast, index) => (
            <div
              className={`group relative bg-white/80 backdrop-blur-xl border border-slate-200/50 rounded-2xl shadow-xl shadow-slate-200/50 p-6 hover:shadow-slate-300/50 transition-all duration-300 ${stast.borderColor}`}
              key={index}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  {stast.label}
                </span>
                <div
                  className={`w-11 h-11 rounded-xl bg-linear-to-br ${stast.gradient} shadow-lg ${stast.shadowColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                >
                  <stast.icon className="w-5 h-5 text-white" strokeWidth={2} />
                </div>
              </div>
              <div className="text-3xl font-semibold text-slate-900 tracking-tight">
                {stast.value}
              </div>
            </div>
          ))}
        </div>

        {/* Recent activity */}
        <div className="bg-white/80 backdrop-blur-xl boder border-slate-200/60 rounded-2xl shadow-xl shadow-slate-200/50 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-linear-to-br from-slate-100 to-slate-200 flex items-center justify-center">
              <Clock className="w-5 h-5 text-slate-600" strokeWidth={2} />
            </div>
            <h3 className="text-xl font-medium text-slate-900 tracking-tight">
              Gần đây
            </h3>
          </div>

          {dashboardData.recentActivity &&
          (dashboardData.recentActivity.documents.length > 0 ||
            dashboardData.recentActivity.quizzes.length > 0) ? (
            <div className="space-y-3">
              {[
                ...(dashboardData.recentActivity.documents || []).map(
                  (doc) => ({
                    id: doc._id,
                    description: doc.title,
                    timestamp: doc.lastAccessed,
                    link: `/documents/${doc._id}`,
                    type: "document",
                  })
                ),
                ...(dashboardData.recentActivity.quizzes || []).map((quiz) => ({
                  id: quiz._id,
                  description: quiz.title,
                  timestamp: quiz.lastAttempted || quiz.completedAt,
                  link: `/quizzes/${quiz._id}`,
                  type: "quiz",
                })),
              ]
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .map((activity, index) => (
                  <div
                    key={activity.id || index}
                    className="group flex items-center justify-center p-4 rounded-xl bg-slate-50/50 border border-slate-200/60 hover:bg-white hover:border-slate-300 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            activity.type === "document"
                              ? "bg-linear-to-r from-blue-400 to-cyan-500"
                              : "bg-linear-to-r from-emerald-400 to-teal-500"
                          }`}
                        ></div>
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {activity.type === "document"
                            ? "Tài liệu: "
                            : "Quizzes: "}
                          <span className="text-slate-700">
                            {activity.description}
                          </span>
                        </p>
                      </div>
                      <p className="text-xs text-slate-500 pl-4">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                    {activity.link && (
                      <a
                        href={activity.link}
                        className="ml-4 px-4 py-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all duration-200 whitespace-nowrap"
                      >
                        Xem
                      </a>
                    )}
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 mb-4">
                <Clock className="w-8 h-8 text-slate-400" strokeWidth={2} />
              </div>
              <p className="text-sm text-slate-600">
                Chưa có hoạt động gần đây.
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Bắt đầu với Hyra ngay bây giờ!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
