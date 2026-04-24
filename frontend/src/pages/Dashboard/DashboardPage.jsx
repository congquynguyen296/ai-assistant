import { useState, useEffect } from "react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import progressService from "../../services/progressService";
import {
  Activity,
  BookOpen,
  BrainCircuit,
  CalendarClock,
  Clock,
  FileText,
  Layers,
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

  const overview = dashboardData.overview;
  const recentDocuments = dashboardData.recentActivity?.documents || [];
  const recentQuizzes = dashboardData.recentActivity?.quizzes || [];
  const recentItems = [
    ...recentDocuments.map((doc) => ({
      id: doc._id,
      timestamp: doc.lastAccessed,
    })),
    ...recentQuizzes.map((quiz) => ({
      id: quiz._id,
      timestamp: quiz.lastAttempted || quiz.completedAt,
    })),
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  const totalItems =
    overview.totalDocuments + overview.totalFlashcards + overview.totalQuizzes;
  const lastActivity = recentItems[0]?.timestamp;

  const stats = [
    {
      label: "Tổng mục học tập",
      value: totalItems,
      subtext: `${overview.totalDocuments} tài liệu · ${overview.totalFlashcards} thẻ · ${overview.totalQuizzes} quiz`,
      icon: Layers,
      accent: "from-slate-900/5 via-slate-100/40 to-white",
      iconStyle: "text-slate-700",
      borderColor: "hover:border-slate-400/60",
    },
    {
      label: "Tài liệu",
      value: overview.totalDocuments,
      subtext: "Nguồn tri thức của bạn",
      icon: FileText,
      accent: "from-sky-500/10 via-cyan-400/10 to-white",
      iconStyle: "text-sky-600",
      borderColor: "hover:border-sky-400/50",
    },
    {
      label: "Flashcards",
      value: overview.totalFlashcards,
      subtext: "Luyện nhớ nhanh mỗi ngày",
      icon: BookOpen,
      accent: "from-rose-500/10 via-pink-400/10 to-white",
      iconStyle: "text-rose-500",
      borderColor: "hover:border-rose-400/50",
    },
    {
      label: "Quizzes",
      value: overview.totalQuizzes,
      subtext: "Tự kiểm tra hiểu bài",
      icon: BrainCircuit,
      accent: "from-emerald-500/10 via-teal-400/10 to-white",
      iconStyle: "text-emerald-600",
      borderColor: "hover:border-emerald-400/50",
    },
    {
      label: "Hoạt động gần đây",
      value: recentItems.length,
      subtext: "Lượt hoạt động mới nhất",
      icon: Activity,
      accent: "from-amber-500/10 via-orange-400/10 to-white",
      iconStyle: "text-amber-600",
      borderColor: "hover:border-amber-400/50",
    },
    {
      label: "Lần cuối hoạt động",
      value: lastActivity
        ? new Date(lastActivity).toLocaleDateString()
        : "Chưa có",
      subtext: lastActivity
        ? new Date(lastActivity).toLocaleTimeString()
        : "Hãy bắt đầu một phiên học",
      icon: CalendarClock,
      accent: "from-violet-500/10 via-indigo-400/10 to-white",
      iconStyle: "text-indigo-600",
      borderColor: "hover:border-indigo-400/50",
    },
  ];

  return (
    <div className="min-h-screen relative w-full">
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] pointer-events-none z-0"></div>
      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-medium text-slate-900 tracking-tight">
              Thống kê tổng quan
            </h1>
            <p className="text-slate-500 text-sm">
              Bức tranh nhanh về nhịp học tập và tiến trình của bạn.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/80 px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
            Dữ liệu cập nhật tự động
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
          {stats.map((stat, index) => (
            <div
              className={`group relative overflow-hidden bg-white/85 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-lg shadow-slate-200/40 p-5 transition-all duration-300 ${stat.borderColor}`}
              key={index}
            >
              <div
                className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-linear-to-br ${stat.accent}`}
              ></div>
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    {stat.label}
                  </span>
                  <div className="text-3xl font-semibold text-slate-900 tracking-tight mt-2">
                    {stat.value}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">{stat.subtext}</p>
                </div>
                <div className="h-11 w-11 rounded-2xl bg-slate-100/80 border border-slate-200/70 flex items-center justify-center">
                  <stat.icon className={`w-5 h-5 ${stat.iconStyle}`} strokeWidth={2} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent activity */}
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-xl shadow-slate-200/50 p-4 sm:p-6">
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
