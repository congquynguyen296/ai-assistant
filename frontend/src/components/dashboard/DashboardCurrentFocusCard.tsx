import { Play, Target } from "lucide-react";

type Props = {
  title: string;
  description: string;
  progressPercent: number;
  nextUp: string;
  resumeHref: string;
};

export default function DashboardCurrentFocusCard({
  title,
  description,
  progressPercent,
  nextUp,
  resumeHref,
}: Props) {
  return (
    <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-5 shadow-sm shadow-emerald-500/5 mb-6 overflow-hidden relative">
      <div className="absolute right-[-40px] top-[-40px] h-44 w-44 rounded-full bg-emerald-100/60 blur-2xl" />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between relative">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wide">
            <span className="h-5 w-5 rounded-full border-2 border-emerald-600 flex items-center justify-center">
              <Target />
            </span>
            Current Focus
          </div>
          <div className="mt-2 text-lg font-semibold text-slate-900 truncate">{title}</div>
          <div className="mt-1 text-sm text-slate-600">{description}</div>

          <div className="mt-4">
            <div className="h-2 rounded-full bg-emerald-100 overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-emerald-500 to-teal-500 rounded-full"
                style={{ width: `${Math.max(0, Math.min(100, progressPercent))}%` }}
              />
            </div>
            <div className="mt-2 text-xs text-slate-500">
              {Math.round(progressPercent)}% through · Next up:{" "}
              <span className="font-semibold text-slate-700">{nextUp}</span>
            </div>
          </div>
        </div>

        <a
          href={resumeHref}
          className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold shadow-md shadow-emerald-700/20 transition-colors whitespace-nowrap"
        >
          <Play className="h-4 w-4" />
          Resume Module
        </a>
      </div>
    </div>
  );
}

