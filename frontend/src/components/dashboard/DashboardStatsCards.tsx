import { BookOpen, BrainCircuit, FileText, TrendingUp } from "lucide-react";

type StatCardProps = {
  label: string;
  value: number;
  subtext: string;
  trendText: string;
  icon: "documents" | "flashcards" | "quizzes";
  accent: "sky" | "rose" | "emerald";
};

const accents: Record<
  StatCardProps["accent"],
  { hoverBg: string; iconWrap: string; iconColor: string; borderHover: string }
> = {
  sky: {
    hoverBg: "from-sky-500/10 via-cyan-400/10 to-white",
    iconWrap: "bg-slate-100/80 border-slate-200/70",
    iconColor: "text-sky-600",
    borderHover: "hover:border-sky-400/50",
  },
  rose: {
    hoverBg: "from-rose-500/10 via-pink-400/10 to-white",
    iconWrap: "bg-rose-50 border-rose-100",
    iconColor: "text-rose-500",
    borderHover: "hover:border-rose-400/50",
  },
  emerald: {
    hoverBg: "from-emerald-500/10 via-teal-400/10 to-white",
    iconWrap: "bg-emerald-50 border-emerald-100",
    iconColor: "text-emerald-600",
    borderHover: "hover:border-emerald-400/50",
  },
};

function StatCard({ label, value, subtext, trendText, icon, accent }: StatCardProps) {
  const Icon = icon === "documents" ? FileText : icon === "flashcards" ? BookOpen : BrainCircuit;
  const a = accents[accent];

  return (
    <div
      className={[
        "group relative overflow-hidden",
        "bg-white/85 backdrop-blur-xl border border-slate-200/60 rounded-2xl",
        "shadow-lg shadow-slate-200/40 p-5 transition-all duration-300",
        a.borderHover,
      ].join(" ")}
    >
      <div
        className={[
          "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
          "bg-linear-to-br",
          a.hoverBg,
        ].join(" ")}
      />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">{value}</div>
          <div className="mt-2 text-xs text-slate-500">{subtext}</div>
          <div className="mt-2 text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5" />
            {trendText}
          </div>
        </div>
        <div
          className={[
            "h-11 w-11 rounded-2xl border flex items-center justify-center",
            a.iconWrap,
          ].join(" ")}
        >
          <Icon className={`w-5 h-5 ${a.iconColor}`} strokeWidth={2} />
        </div>
      </div>
    </div>
  );
}

type Props = {
  documents: { value: number; thisWeek: number };
  flashcards: { value: number; thisWeek: number };
  quizzes: { value: number; avgScoreText: string };
};

export default function DashboardStatsCards({ documents, flashcards, quizzes }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <StatCard
        label="Documents analyzed"
        value={documents.value}
        subtext=""
        trendText={`${documents.thisWeek} this week`}
        icon="documents"
        accent="sky"
      />
      <StatCard
        label="Flashcards mastered"
        value={flashcards.value}
        subtext=""
        trendText={`${flashcards.thisWeek} this week`}
        icon="flashcards"
        accent="rose"
      />
      <StatCard
        label="Quizzes completed"
        value={quizzes.value}
        subtext={quizzes.avgScoreText}
        trendText=""
        icon="quizzes"
        accent="emerald"
      />
    </div>
  );
}

