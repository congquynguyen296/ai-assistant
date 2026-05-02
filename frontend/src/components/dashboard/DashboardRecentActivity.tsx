import { Activity, BrainCircuit, Clock, FileText } from "lucide-react";

export type DashboardRecentActivityItem = {
  id: string;
  type: "document" | "quiz" | "flashcards";
  title: string;
  subtitle: string;
  timestamp?: string;
  accent: "emerald" | "rose" | "slate";
  link?: string;
};

type Props = {
  items: DashboardRecentActivityItem[];
  viewAllHref: string;
};

export default function DashboardRecentActivity({ items, viewAllHref }: Props) {
  return (
    <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-xl shadow-slate-200/50 p-5">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="text-sm font-semibold text-slate-900">Recent Activity</div>
        <a href={viewAllHref} className="text-xs font-semibold text-emerald-700 hover:text-emerald-800">
          View All
        </a>
      </div>

      {items.length > 0 ? (
        <div className="space-y-3">
          {items.map((item) => {
            const iconWrap =
              item.accent === "emerald"
                ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                : item.accent === "rose"
                  ? "bg-rose-50 border-rose-100 text-rose-600"
                  : "bg-slate-50 border-slate-200 text-slate-600";

            const Icon =
              item.type === "quiz" ? BrainCircuit : item.type === "flashcards" ? Activity : FileText;

            const body = (
              <div className="flex items-start gap-3">
                <div className={`h-10 w-10 rounded-2xl border flex items-center justify-center ${iconWrap}`}>
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-900 leading-snug">{item.title}</div>
                  <div className="text-xs text-slate-500 mt-1">
                    {item.subtitle}
                    {item.timestamp ? ` • ${new Date(item.timestamp).toLocaleString()}` : ""}
                  </div>
                </div>
              </div>
            );

            return item.link ? (
              <a
                key={item.id}
                href={item.link}
                className="block rounded-2xl border border-slate-200 bg-white hover:bg-slate-50/60 transition-colors p-3"
              >
                {body}
              </a>
            ) : (
              <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-3">
                {body}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 mb-4">
            <Clock className="w-8 h-8 text-slate-400" strokeWidth={2} />
          </div>
          <p className="text-sm text-slate-600">Chưa có hoạt động gần đây.</p>
        </div>
      )}
    </div>
  );
}

