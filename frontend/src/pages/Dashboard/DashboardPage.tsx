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

  const recentActivityItems: DashboardRecentActivityItem[] = [
    ...(recentQuizzes || []).map((quiz: any) => ({
      id: quiz._id,
      type: "quiz" as const,
      title: `Completed Quiz: ${quiz.title ?? "Quiz"}`,
      subtitle: quiz.score != null ? `Avg Score: ${quiz.score}%` : "Quiz activity",
      timestamp: quiz.lastAttempted || quiz.completedAt,
      accent: "emerald" as const,
      link: quiz._id ? `/quizzes/${quiz._id}` : undefined,
    })),
    ...(recentDocuments || []).map((doc: any) => ({
      id: doc._id,
      type: "document" as const,
      title: `Uploaded '${doc.title ?? "Document"}'`,
      subtitle: "PDF Document",
      timestamp: doc.lastAccessed,
      accent: "slate" as const,
      link: doc._id ? `/documents/${doc._id}` : undefined,
    })),
  ]
    .filter((x) => Boolean(x.id))
    .sort((a, b) => new Date(b.timestamp ?? 0).getTime() - new Date(a.timestamp ?? 0).getTime())
    .slice(0, 5);

  const focusTitle = "Neural Networks & Deep Learning";
  const focusProgress = 75;
  const focusNext = "Backpropagation";
  const focusDesc =
    "You are 75% through Module 3. Next up: Backpropagation algorithms and practical implementation.";

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
  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

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
          { day: "Mon", value: 1 },
          { day: "Tue", value: 2 },
          { day: "Wed", value: 2 },
          { day: "Thu", value: 3 },
          { day: "Fri", value: 2 },
          { day: "Sat", value: 4 },
          { day: "Sun", value: 3 },
        ];

  return (
    <div className="min-h-screen relative w-full">
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] pointer-events-none z-0"></div>
      <div className="relative max-w-7xl mx-auto">
        {/* Header */}

        {/* Current focus */}
        <DashboardCurrentFocusCard
          title={focusTitle}
          description={focusDesc}
          progressPercent={focusProgress}
          nextUp={focusNext}
          resumeHref="/documents"
        />

        {/* Stats cards */}
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
                ? `Avg Score: ${recentQuizzes[0].score}%`
                : `+ ${quizzesThisWeek} this week`,
          }}
        />

        {/* Lower grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pb-10">
          {/* Learning pulse */}
          <DashboardLearningPulse data={pulseData} />

          {/* Recent activity */}
          <DashboardRecentActivity items={recentActivityItems} viewAllHref="/documents" />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
