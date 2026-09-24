import { useState, useEffect } from "react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import progressService from "@/services/progressService";
import {
  BrainCircuit,
  TrendingUp,
} from "lucide-react";
import DashboardCurrentFocusCard from "@/components/dashboard/DashboardCurrentFocusCard";
import DashboardLearningPulse from "@/components/dashboard/DashboardLearningPulse";
import DashboardRecentActivity, {
  type DashboardRecentActivityItem,
} from "@/components/dashboard/DashboardRecentActivity";
import DashboardStatsCards from "@/components/dashboard/DashboardStatsCards";

const DashboardPage = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dashboardData, setDashboardData] = useState<any>(null);
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



  const overview = dashboardData?.overview;
  const recentDocuments = dashboardData?.recentActivity?.documents || [];
  const recentQuizzes = dashboardData?.recentActivity?.quizzes || [];
  const recentInterviews = dashboardData?.recentActivity?.interviews || [];
  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const countThisWeek = (items: any[], getTs: (x: any) => string | undefined) =>
    items.filter((x) => {
      const ts = getTs(x);
      if (!ts) return false;
      return new Date(ts).getTime() >= weekAgo;
    }).length;

  const docsThisWeek = countThisWeek(recentDocuments, (d) => d.lastAccessed);
  const quizzesThisWeek = countThisWeek(recentQuizzes, (q) => q.lastAttempted || q.completedAt);
  const interviewsThisWeek = countThisWeek(recentInterviews, (i) => i.updatedAt);

  const recentActivityItems: DashboardRecentActivityItem[] = [
    ...(recentQuizzes || []).map((quiz: any) => ({
      id: quiz._id,
      type: "quiz" as const,
      title: `Đã hoàn thành bài kiểm tra: ${quiz.title ?? "Bài kiểm tra"}`,
      subtitle: quiz.score != null ? `Điểm trung bình: ${quiz.score}%` : "Hoạt động bài kiểm tra",
      timestamp: quiz.lastAttempted || quiz.completedAt,
      accent: "emerald" as const,
      link: quiz._id ? `/quizzes/${quiz._id}` : undefined,
    })),
    ...(recentDocuments || []).map((doc: any) => ({
      id: doc._id,
      type: "document" as const,
      title: `Đã tải lên '${doc.title ?? "Tài liệu"}'`,
      subtitle: "Tài liệu PDF",
      timestamp: doc.lastAccessed,
      accent: doc.status === "completed" ? ("emerald" as const) : doc.status === "failed" ? ("rose" as const) : doc.status === "processing" || doc.status === "pending" ? ("amber" as const) : ("slate" as const),
      link: doc._id ? `/documents/${doc._id}` : undefined,
    })),
    ...(recentInterviews || []).map((interview: any) => ({
      id: interview._id,
      type: "interview" as const,
      title: `Phiên phỏng vấn: ${interview.blueprint?.title || "Phỏng vấn"}`,
      subtitle: interview.status === "completed" ? `Điểm số: ${interview.report?.overallScore || 0}/100` : "Đang tiến hành",
      timestamp: interview.updatedAt,
      accent: interview.status === "completed" ? ("emerald" as const) : ("amber" as const),
      link: interview._id ? `/interviews/${interview._id}${interview.status === "completed" ? "/report" : ""}` : undefined,
    })),
  ]
    .filter((x) => Boolean(x.id))
    .sort((a, b) => new Date(b.timestamp ?? 0).getTime() - new Date(a.timestamp ?? 0).getTime())
    .slice(0, 5);

  let focusTitle = "Bắt đầu hành trình học tập";
  let focusDesc = "Tải lên tài liệu đầu tiên để hệ thống AI bóc tách kiến thức và tạo Flashcards giúp bạn.";
  let focusProgress = 0;
  let focusNext = "Tải tài liệu";
  let resumeHref = "/documents";

  if (recentDocuments && recentDocuments.length > 0) {
    const latestDoc = recentDocuments[0];
    focusTitle = latestDoc.title || latestDoc.fileName || "Tài liệu gần nhất";
    
    const flashcardsToReview = Math.max(0, overview.totalFlashcards - overview.reviviewedFlashcards);
    
    if (overview.totalFlashcards > 0) {
      focusProgress = Math.round((overview.reviviewedFlashcards / overview.totalFlashcards) * 100);
      focusDesc = flashcardsToReview > 0 
        ? `Tích cực lên! Bạn còn ${flashcardsToReview} Flashcard cần ôn tập. Điểm trung bình Quiz hiện tại là ${overview.averageScore}%.` 
        : `Tuyệt vời! Bạn đã hoàn thành ôn tập tất cả Flashcard. Điểm trung bình Quiz: ${overview.averageScore}%.`;
      focusNext = flashcardsToReview > 0 ? "Ôn tập ngay" : "Xem sơ đồ kiến thức";
      resumeHref = `/documents/${latestDoc._id}`;
    } else {
      focusDesc = "Tài liệu này đã được tải lên. Hãy khám phá Sơ đồ kiến thức hoặc tạo Flashcard từ tài liệu này nhé!";
      focusNext = "Khám phá ngay";
      resumeHref = `/documents/${latestDoc._id}`;
    }
  }

  // Learning pulse (this week)
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const nowDate = new Date();
  const dayIndex = (nowDate.getDay() + 6) % 7; // Monday=0 ... Sunday=6
  const monday = new Date(nowDate);
  monday.setDate(nowDate.getDate() - dayIndex);
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
  const dayLabels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

  const activityTimestamps: number[] = [
    ...recentDocuments.map((d: any) => new Date(d.lastAccessed).getTime()).filter((x: number) => Number.isFinite(x)),
    ...recentQuizzes
      .map((q: any) => new Date(q.lastAttempted || q.completedAt).getTime())
      .filter((x: number) => Number.isFinite(x)),
  ];

  const learningPulseData = weekDays.map((d, i) => {
    const start = startOfDay(d);
    const end = start + 24 * 60 * 60 * 1000;
    const value = activityTimestamps.filter((t) => t >= start && t < end).length;
    return { day: dayLabels[i], value };
  });
  const pulseSum = learningPulseData.reduce((acc, x) => acc + x.value, 0);
  const pulseData =
    pulseSum > 0
      ? learningPulseData
      : [
          { day: "T2", value: 1 },
          { day: "T3", value: 2 },
          { day: "T4", value: 2 },
          { day: "T5", value: 3 },
          { day: "T6", value: 2 },
          { day: "T7", value: 4 },
          { day: "CN", value: 3 },
        ];

  return (
    <div className="min-h-screen relative w-full">
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] pointer-events-none z-0"></div>
      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 pt-8 px-4 sm:px-0">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
            Tổng quan
          </h1>
          <p className="text-slate-500">
            Theo dõi tiến độ và hoạt động học tập của bạn
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <LoadingSpinner variant="inline" />
          </div>
        ) : !dashboardData || !dashboardData.overview ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 mb-4">
                <TrendingUp className="w-8 h-8 text-emerald-500" />
              </div>
              <p className="text-sm text-slate-600">Chưa có dữ liệu.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Current focus */}
            <div id="tour-dashboard-focus">
              <DashboardCurrentFocusCard
                title={focusTitle}
                description={focusDesc}
                progressPercent={focusProgress}
                nextUp={focusNext}
                resumeHref={resumeHref}
              />
            </div>

            <DashboardStatsCards
              documents={{ value: overview.totalDocuments, thisWeek: docsThisWeek }}
              flashcards={{
                value: overview.totalFlashcards,
                thisWeek: Math.max(0, Math.round(overview.totalFlashcards * 0.02)),
              }}
              quizzes={{
                value: overview.totalQuizzes,
                avgScoreText:
                  recentQuizzes?.[0]?.score != null
                    ? `Điểm TB: ${recentQuizzes[0].score}%`
                    : `+ ${quizzesThisWeek} tuần này`,
              }}
              interviews={{
                value: overview.totalInterviews || 0,
                thisWeek: interviewsThisWeek,
              }}
            />

            {/* Lower grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pb-10">
              {/* Learning pulse */}
              <DashboardLearningPulse data={pulseData} />

              {/* Recent activity */}
              <DashboardRecentActivity items={recentActivityItems} viewAllHref="/documents" />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
